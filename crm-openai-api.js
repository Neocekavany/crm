/**
 * API endpoints pro komunikaci s OpenAI - určeno pro vývojářský panel
 */

import express from 'express';
import openaiService from './api-openai.js';

const router = express.Router();

// Middleware pro ověření role vývojáře - v produkčním prostředí by měla být robustnější
const ensureDeveloper = (req, res, next) => {
  // Toto je jen zjednodušené ověření pro vývojové prostředí
  // V reálném nasazení byste měli implementovat robustnější autentizaci
  const isDeveloper = true; // V produkci nahraďte skutečnou kontrolou role
  
  if (isDeveloper) {
    next();
  } else {
    res.status(403).json({ error: 'Přístup odepřen. Vyžadována role vývojáře.' });
  }
};

// Middleware pro základní validaci
const validateBody = (requiredFields) => {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Chybí povinné pole: ${field}` });
      }
    }
    next();
  };
};

// Endpoint pro analýzu kódu
router.post('/analyze-code', ensureDeveloper, validateBody(['code']), async (req, res) => {
  try {
    const { code } = req.body;
    const analysis = await openaiService.analyzeCode(code);
    res.json({ analysis });
  } catch (error) {
    console.error('Chyba při analýze kódu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro generování dokumentace
router.post('/generate-documentation', ensureDeveloper, validateBody(['code']), async (req, res) => {
  try {
    const { code } = req.body;
    const documentation = await openaiService.generateDocumentation(code);
    res.json({ documentation });
  } catch (error) {
    console.error('Chyba při generování dokumentace:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro debugování kódu
router.post('/debug-code', ensureDeveloper, validateBody(['code', 'errorMessage']), async (req, res) => {
  try {
    const { code, errorMessage } = req.body;
    const debugSolution = await openaiService.debugCode(code, errorMessage);
    res.json({ solution: debugSolution });
  } catch (error) {
    console.error('Chyba při debugování kódu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro generování nové funkcionality
router.post('/generate-feature', ensureDeveloper, validateBody(['description', 'framework']), async (req, res) => {
  try {
    const { description, framework } = req.body;
    const generatedCode = await openaiService.generateFeature(description, framework);
    res.json({ generatedCode });
  } catch (error) {
    console.error('Chyba při generování funkcionality:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro obecný dotaz
router.post('/ask-question', ensureDeveloper, validateBody(['query']), async (req, res) => {
  try {
    const { query } = req.body;
    const answer = await openaiService.askQuestion(query);
    res.json({ answer });
  } catch (error) {
    console.error('Chyba při zpracování dotazu:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pro generování testů
router.post('/generate-tests', ensureDeveloper, validateBody(['code', 'testFramework']), async (req, res) => {
  try {
    const { code, testFramework } = req.body;
    const generatedTests = await openaiService.generateTests(code, testFramework);
    res.json({ generatedTests });
  } catch (error) {
    console.error('Chyba při generování testů:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;