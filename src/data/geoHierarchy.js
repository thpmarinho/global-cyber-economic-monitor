/**
 * Hierarquia Geográfica Multi-Nível (País -> Estado -> Município)
 */

export const GEO_HIERARCHY = {
  ALL: { label: "Visão Global (Todos os Países)", states: {} },
  BR: {
    label: "Brasil",
    states: {
      AM: { label: "Amazonas", cities: ["Manaus", "Itacoatiara"] },
      SP: { label: "São Paulo", cities: ["São Paulo", "Campinas"] },
      MT: { label: "Mato Grosso", cities: ["Sorriso", "Cuiabá"] },
      RJ: { label: "Rio de Janeiro", cities: ["Rio de Janeiro", "Macaé"] },
    },
  },
  US: {
    label: "Estados Unidos",
    states: {
      CA: { label: "Califórnia", cities: ["San Francisco", "San Jose"] },
      NY: { label: "Nova York", cities: ["New York"] },
    },
  },
  DE: {
    label: "Alemanha",
    states: {
      HE: { label: "Hesse", cities: ["Frankfurt"] },
    },
  },
  CN: {
    label: "China",
    states: {
      GD: { label: "Guangdong", cities: ["Shenzhen"] },
    },
  },
  JP: {
    label: "Japão",
    states: {
      TK: { label: "Tóquio", cities: ["Tóquio"] },
    },
  },
};

/**
 * Retorna os estados disponíveis para um país.
 * @param {string} countryCode
 * @returns {Record<string, { label: string, cities: string[] }>}
 */
export function getAvailableStates(countryCode) {
  if (!countryCode || countryCode === "ALL" || !GEO_HIERARCHY[countryCode]) {
    return {};
  }
  return GEO_HIERARCHY[countryCode].states || {};
}

/**
 * Retorna os municípios disponíveis para um estado de um país.
 * @param {string} countryCode
 * @param {string} stateCode
 * @returns {string[]}
 */
export function getAvailableCities(countryCode, stateCode) {
  const states = getAvailableStates(countryCode);
  if (!stateCode || stateCode === "ALL" || !states[stateCode]) {
    return [];
  }
  return states[stateCode].cities || [];
}
