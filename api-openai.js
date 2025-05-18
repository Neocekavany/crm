import OpenAI from 'openai';

// Inicializace OpenAI klienta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Služba pro práci s OpenAI API
 */
export class OpenAIService {
  /**
   * Analyzuje kód a poskytne rady na zlepšení
   * @param {string} code - Kód k analýze
   * @returns {Promise<string>} - Výsledky analýzy
   */
  async analyzeCode(code) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Jsi expertní vývojářský asistent. Máš za úkol analyzovat kód a poskytnout rady na jeho zlepšení. Zaměř se na výkon, bezpečnost, čitelnost a osvědčené postupy."
          },
          {
            role: "user",
            content: `Analyzuj prosím následující kód a poskytni rady na jeho zlepšení:\n\n${code}`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při analýze kódu:', error);
      throw new Error(`Nepodařilo se analyzovat kód: ${error.message}`);
    }
  }

  /**
   * Generuje dokumentaci pro kód
   * @param {string} code - Kód k dokumentaci
   * @returns {Promise<string>} - Vygenerovaná dokumentace
   */
  async generateDocumentation(code) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Jsi expertní dokumentační asistent. Tvým úkolem je generovat podrobnou dokumentaci ke kódu. Zahrň popis funkce, parametry, návratové hodnoty a příklady použití."
          },
          {
            role: "user",
            content: `Vygeneruj prosím dokumentaci pro následující kód:\n\n${code}`
          }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při generování dokumentace:', error);
      throw new Error(`Nepodařilo se vygenerovat dokumentaci: ${error.message}`);
    }
  }

  /**
   * Pomáhá řešit problémy s kódem
   * @param {string} code - Problematický kód
   * @param {string} errorMessage - Chybová zpráva
   * @returns {Promise<string>} - Navrhované řešení
   */
  async debugCode(code, errorMessage) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Jsi expertní debugovací asistent. Tvým úkolem je analyzovat kód a chybovou zprávu, najít příčinu problému a navrhnout řešení."
          },
          {
            role: "user",
            content: `Mám problém s následujícím kódem:\n\n${code}\n\nChybová zpráva:\n${errorMessage}\n\nProsím pomoz mi najít a opravit problém.`
          }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při debugování kódu:', error);
      throw new Error(`Nepodařilo se debugovat kód: ${error.message}`);
    }
  }

  /**
   * Generuje nové funkce nebo komponenty na základě popisu
   * @param {string} description - Popis požadované funkcionality
   * @param {string} framework - Použitý framework (např. 'react', 'express')
   * @returns {Promise<string>} - Vygenerovaný kód
   */
  async generateFeature(description, framework) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Jsi expertní vývojářský asistent pro framework ${framework}. Tvým úkolem je generovat kód podle popisu funkcionality.`
          },
          {
            role: "user",
            content: `Vygeneruj prosím kód pro následující funkcionalitu:\n\n${description}\n\nPoužívám framework: ${framework}`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při generování funkcionality:', error);
      throw new Error(`Nepodařilo se vygenerovat funkcionalitu: ${error.message}`);
    }
  }

  /**
   * Obecný dotaz na AI asistenta
   * @param {string} query - Dotaz uživatele
   * @returns {Promise<string>} - Odpověď
   */
  async askQuestion(query) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Jsi expertní vývojářský asistent pro CRM systém. Pomáháš vývojářům s otázkami ohledně vývoje, architektury, optimalizace a osvědčených postupů."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při zpracování dotazu:', error);
      throw new Error(`Nepodařilo se zpracovat dotaz: ${error.message}`);
    }
  }

  /**
   * Generuje testovací případy pro zadaný kód
   * @param {string} code - Kód, pro který generujeme testy
   * @param {string} testFramework - Testovací framework (např. 'jest', 'mocha')
   * @returns {Promise<string>} - Vygenerované testy
   */
  async generateTests(code, testFramework) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Jsi expertní tester. Tvým úkolem je generovat testovací případy pro kód s použitím frameworku ${testFramework}. Zahrň pozitivní i negativní testovací scénáře.`
          },
          {
            role: "user",
            content: `Vygeneruj prosím testy pro následující kód s použitím frameworku ${testFramework}:\n\n${code}`
          }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Chyba při generování testů:', error);
      throw new Error(`Nepodařilo se vygenerovat testy: ${error.message}`);
    }
  }
}

export default new OpenAIService();