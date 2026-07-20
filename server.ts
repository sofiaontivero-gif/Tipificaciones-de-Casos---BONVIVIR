import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { TYPIFICATIONS_DATA } from "./src/data/typifications.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment.");
}

// Health check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Typifications database retrieval
app.get("/api/typifications", (req, res) => {
  res.json({ success: true, data: TYPIFICATIONS_DATA });
});

// Classification endpoint using Gemini 3.5 Flash
app.post("/api/classify", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || query.trim() === "") {
      res.status(400).json({ success: false, error: "La consulta del cliente es requerida." });
      return;
    }

    if (!aiClient) {
      // Local rule-based keyword matching fallback to guarantee it always works even without API Key!
      const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const queryNorm = normalize(query);
      
      let bestMatch = null;
      let highestScore = 0;

      for (const t of TYPIFICATIONS_DATA) {
        let score = 0;
        
        const cat = normalize(t.categoria);
        const sub = normalize(t.subcategoria);
        const mot = normalize(t.motivo);
        const det = normalize(t.operacionDetalle);
        const ex = normalize(t.ejemplo);

        // Exact match of key terms
        if (queryNorm.includes("baja") || queryNorm.includes("cancelar") || queryNorm.includes("anular") || queryNorm.includes("suspender")) {
          if (sub.includes("anulacion") || sub.includes("cancelacion") || mot.includes("anulacion") || mot.includes("cancelacion") || sub.includes("suspension") || mot.includes("suspension")) {
            score += 15;
          }
        }
        if (queryNorm.includes("tarjeta") || queryNorm.includes("tc") || queryNorm.includes("tarjeta de credito") || queryNorm.includes("plastico")) {
          if (sub.includes("tc") || mot.includes("tc") || ex.includes("tc") || ex.includes("tarjeta")) {
            score += 15;
          }
        }
        if (queryNorm.includes("cobro") || queryNorm.includes("duplicado") || queryNorm.includes("factura") || queryNorm.includes("cobro duplicado") || queryNorm.includes("diferencia")) {
          if (sub.includes("cobro duplicado") || mot.includes("cobro duplicado") || ex.includes("cobro duplicado") || ex.includes("duplicado") || sub.includes("importe facturado") || sub.includes("cobranza")) {
            score += 12;
          }
        }
        if (queryNorm.includes("envio") || queryNorm.includes("correo") || queryNorm.includes("domicilio") || queryNorm.includes("entregar") || queryNorm.includes("llego") || queryNorm.includes("llegar")) {
          if (cat.includes("entrega") || sub.includes("correo") || mot.includes("domicilio") || ex.includes("correo") || ex.includes("envio") || sub.includes("funcionamiento")) {
            score += 10;
          }
        }
        if (queryNorm.includes("amigo") || queryNorm.includes("recomendar") || queryNorm.includes("invitar")) {
          if (mot.includes("amigo") || ex.includes("amigo") || sub.includes("beneficios") || sub.includes("ventas")) {
            score += 15;
          }
        }

        // Generic word overlap
        const words = queryNorm.split(/\s+/).filter(w => w.length > 3);
        for (const word of words) {
          if (cat.includes(word)) score += 1;
          if (sub.includes(word)) score += 2;
          if (mot.includes(word)) score += 3;
          if (det.includes(word)) score += 1;
          if (ex.includes(word)) score += 2;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = t;
        }
      }

      if (bestMatch && highestScore >= 1) {
        res.json({
          success: true,
          suggestedId: bestMatch.id,
          confidence: Math.min(0.6 + (highestScore / 30), 0.98),
          explanation: `Clasificado mediante motor de búsqueda local inteligente (Coincidencia detectada en la categoría ${bestMatch.categoria} para la consulta '${query}'). Para análisis semántico avanzado, puedes configurar la API Key de Gemini en los ajustes.`,
          suggestedPath: [
            bestMatch.origen,
            bestMatch.area,
            bestMatch.grupo,
            bestMatch.categoria,
            bestMatch.subcategoria,
            bestMatch.motivo,
            bestMatch.operacionDetalle
          ]
        });
        return;
      }

      res.status(503).json({
        success: false,
        error: "El servicio de Inteligencia Artificial no está configurado (Falta la API Key de Gemini) y no se encontró una coincidencia clara en la base de datos local."
      });
      return;
    }

    // Build lists of typifications for the context
    const typListStr = TYPIFICATIONS_DATA.map((t) => {
      return `ID: ${t.id}
- Categoria: ${t.categoria}
- Subcategoria: ${t.subcategoria}
- Motivo: ${t.motivo}
- OperacionDetalle: ${t.operacionDetalle}
- Ejemplo: ${t.ejemplo}`;
    }).join("\n\n");

    const systemInstruction = `Eres un asistente experto para agentes de un Call Center de "BONVIVIR" (Club de vinos).
Tu tarea es clasificar la consulta de un cliente en una de las tipificaciones disponibles del Excel oficial.
Te daremos la consulta del cliente y la lista de tipificaciones con sus IDs y descripciones.
Debes seleccionar el ID de la tipificación que mejor se ajuste a la consulta.
Si la consulta es muy ambigua, selecciona la que tenga mayor probabilidad y pon un nivel de confianza (confidence) menor.
Tu respuesta debe ser un objeto JSON con los campos requeridos: suggestedId (ej. typ-12), confidence (entre 0.0 y 1.0) y explanation (una explicación breve y amigable en español del por qué de la selección).`;

    const prompt = `Consulta del cliente: "${query}"

Lista de tipificaciones disponibles:
${typListStr}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for deterministic classification
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedId: {
              type: Type.STRING,
              description: "El ID de la tipificación que mejor coincide con la consulta, por ejemplo 'typ-12'."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Nivel de confianza en la clasificación, de 0.0 a 1.0."
            },
            explanation: {
              type: Type.STRING,
              description: "Explicación breve y profesional en español de por qué se eligió esta tipificación."
            }
          },
          required: ["suggestedId", "confidence", "explanation"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      res.status(500).json({ success: false, error: "No se obtuvo respuesta del clasificador." });
      return;
    }

    const classificationResult = JSON.parse(responseText.trim());
    const matched = TYPIFICATIONS_DATA.find((t) => t.id === classificationResult.suggestedId);

    if (!matched) {
      res.json({
        success: true,
        suggestedId: null,
        confidence: 0,
        explanation: "No se pudo mapear con certeza a una tipificación existente.",
        suggestedPath: []
      });
      return;
    }

    res.json({
      success: true,
      suggestedId: matched.id,
      confidence: classificationResult.confidence,
      explanation: classificationResult.explanation,
      suggestedPath: [
        matched.origen,
        matched.area,
        matched.grupo,
        matched.categoria,
        matched.subcategoria,
        matched.motivo,
        matched.operacionDetalle
      ]
    });

  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({ success: false, error: error.message || "Error interno al clasificar la consulta." });
  }
});

// Configure Vite middleware / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Call Center Typification Server running on port ${PORT}`);
  });
}

startServer();
