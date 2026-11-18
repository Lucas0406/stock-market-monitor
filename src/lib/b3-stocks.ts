export interface B3StockItem {
  ticker: string;
  name: string;
  sector?: string;
}

export const B3_STOCKS: B3StockItem[] = [
  // Petróleo, Gás e Biocombustíveis
  { ticker: "PETR4", name: "Petrobras PN", sector: "Petróleo e Gás" },
  { ticker: "PETR3", name: "Petrobras ON", sector: "Petróleo e Gás" },
  { ticker: "PRIO3", name: "PRIO (Petrorio) ON", sector: "Petróleo e Gás" },
  { ticker: "RECV3", name: "PetroRecôncavo ON", sector: "Petróleo e Gás" },
  { ticker: "UGPA3", name: "Ultrapar ON", sector: "Distribuição" },
  { ticker: "CSAN3", name: "Cosan ON", sector: "Agronegócio e Energia" },
  { ticker: "VBBR3", name: "Vibra Energia ON", sector: "Distribuição" },

  // Mineração e Siderurgia
  { ticker: "VALE3", name: "Vale S.A. ON", sector: "Mineração" },
  { ticker: "GGBR4", name: "Gerdau PN", sector: "Siderurgia" },
  { ticker: "GOAU4", name: "Metalúrgica Gerdau PN", sector: "Siderurgia" },
  { ticker: "CSNA3", name: "Companhia Siderúrgica Nacional ON", sector: "Siderurgia" },
  { ticker: "USIM5", name: "Usiminas PNA", sector: "Siderurgia" },
  { ticker: "CMIN3", name: "CSN Mineração ON", sector: "Mineração" },

  // Financeiro e Bancos
  { ticker: "ITUB4", name: "Itaú Unibanco PN", sector: "Bancos" },
  { ticker: "ITUB3", name: "Itaú Unibanco ON", sector: "Bancos" },
  { ticker: "BBDC4", name: "Banco Bradesco PN", sector: "Bancos" },
  { ticker: "BBDC3", name: "Banco Bradesco ON", sector: "Bancos" },
  { ticker: "BBAS3", name: "Banco do Brasil ON", sector: "Bancos" },
  { ticker: "SANB11", name: "Banco Santander Brasil Unit", sector: "Bancos" },
  { ticker: "ITSA4", name: "Itaúsa PN", sector: "Holdings" },
  { ticker: "B3SA3", name: "B3 S.A. Brasil Bolsa Balcão ON", sector: "Serviços Financeiros" },
  { ticker: "BPAC11", name: "BTG Pactual Unit", sector: "Bancos de Investimento" },
  { ticker: "BBSE3", name: "BB Seguridade ON", sector: "Seguros" },
  { ticker: "CXSE3", name: "Caixa Seguridade ON", sector: "Seguros" },
  { ticker: "PSSA3", name: "Porto Seguro ON", sector: "Seguros" },
  { ticker: "IRBR3", name: "IRB Brasil RE ON", sector: "Resseguros" },

  // Bens Industriais e Máquinas
  { ticker: "WEGE3", name: "WEG S.A. ON", sector: "Motores e Energia" },
  { ticker: "EMBR3", name: "Embraer ON", sector: "Aeroespacial" },
  { ticker: "TUPY3", name: "Tupy ON", sector: "Autopeças" },
  { ticker: "POMO4", name: "Marcopolo PN", sector: "Veículos" },
  { ticker: "RAPT4", name: "Randoncorp PN", sector: "Autopeças" },

  // Consumo Não Cíclico
  { ticker: "ABEV3", name: "Ambev S.A. ON", sector: "Bebidas" },
  { ticker: "JBSS3", name: "JBS S.A. ON", sector: "Alimentos" },
  { ticker: "BRFS3", name: "BRF S.A. ON", sector: "Alimentos" },
  { ticker: "MRFG3", name: "Marfrig ON", sector: "Alimentos" },
  { ticker: "BEEF3", name: "Minerva ON", sector: "Alimentos" },
  { ticker: "SMTO3", name: "São Martinho ON", sector: "Açúcar e Álcool" },
  { ticker: "MDIA3", name: "M. Dias Branco ON", sector: "Alimentos" },
  { ticker: "ASAI3", name: "Assaí Atacadista ON", sector: "Varejo Alimentício" },
  { ticker: "CRFB3", name: "Carrefour Brasil ON", sector: "Varejo Alimentício" },

  // Consumo Cíclico e Varejo
  { ticker: "MGLU3", name: "Magazine Luiza ON", sector: "Varejo Digital" },
  { ticker: "BHIA3", name: "Casas Bahia ON", sector: "Varejo" },
  { ticker: "LREN3", name: "Lojas Renner ON", sector: "Moda e Varejo" },
  { ticker: "ARZZ3", name: "Arezzo & Co ON", sector: "Moda e Calçados" },
  { ticker: "ALPA4", name: "Alpargatas PN", sector: "Calçados" },
  { ticker: "SOMA3", name: "Grupo Soma ON", sector: "Moda" },
  { ticker: "PETZ3", name: "Petz ON", sector: "Varejo Pet" },
  { ticker: "CVCB3", name: "CVC Brasil ON", sector: "Turismo" },
  { ticker: "RENT3", name: "Localiza Rent a Car ON", sector: "Locação de Veículos" },
  { ticker: "MOVI3", name: "Movida ON", sector: "Locação de Veículos" },
  { ticker: "AZUL4", name: "Azul Linhas Aéreas PN", sector: "Transporte Aéreo" },
  { ticker: "GOLL4", name: "GOL Linhas Aéreas PN", sector: "Transporte Aéreo" },

  // Energia Elétrica e Saneamento
  { ticker: "ELET3", name: "Eletrobras ON", sector: "Energia Elétrica" },
  { ticker: "ELET6", name: "Eletrobras PNB", sector: "Energia Elétrica" },
  { ticker: "EQTL3", name: "Equatorial Energia ON", sector: "Energia Elétrica" },
  { ticker: "ENEV3", name: "Eneva ON", sector: "Geração de Energia" },
  { ticker: "CPFE3", name: "CPFL Energia ON", sector: "Energia Elétrica" },
  { ticker: "CMIG4", name: "Cemig PN", sector: "Energia Elétrica" },
  { ticker: "EGIE3", name: "Engie Brasil ON", sector: "Energia Elétrica" },
  { ticker: "TAEE11", name: "Taesa Unit", sector: "Transmissão Elétrica" },
  { ticker: "TRPL4", name: "ISA Cteep PN", sector: "Transmissão Elétrica" },
  { ticker: "SBSP3", name: "Sabesp ON", sector: "Saneamento" },
  { ticker: "CSMG3", name: "Copasa ON", sector: "Saneamento" },
  { ticker: "SAPR11", name: "Sanepar Unit", sector: "Saneamento" },
  { ticker: "CPLE6", name: "Copel PNB", sector: "Energia Elétrica" },

  // Telecomunicações e Tecnologia
  { ticker: "VIVT3", name: "Telefônica Brasil (Vivo) ON", sector: "Telecomunicações" },
  { ticker: "TIMS3", name: "TIM Brasil ON", sector: "Telecomunicações" },
  { ticker: "TOTS3", name: "Totvs ON", sector: "Software e Tecnologia" },
  { ticker: "LWSA3", name: "Locaweb ON", sector: "Tecnologia da Informação" },
  { ticker: "CASH3", name: "Méliuz ON", sector: "Tecnologia e Fidelidade" },

  // Saúde e Farmacêutica
  { ticker: "RDOR3", name: "Rede D'Or São Luiz ON", sector: "Hospitais e Saúde" },
  { ticker: "HAPV3", name: "Hapvida NotreDame Intermédica ON", sector: "Planos de Saúde" },
  { ticker: "RADL3", name: "RaiaDrogasil ON", sector: "Farmácias" },
  { ticker: "FLRY3", name: "Fleury ON", sector: "Medicina Diagnóstica" },
  { ticker: "HYPE3", name: "Hypera Pharma ON", sector: "Farmacêutica" },
  { ticker: "ONCO3", name: "Oncoclínicas ON", sector: "Oncologia" },

  // Construção e Propriedades
  { ticker: "CYRE3", name: "Cyrela Brazil Realty ON", sector: "Construção Civil" },
  { ticker: "EZTC3", name: "EZTec ON", sector: "Construção Civil" },
  { ticker: "MRVE3", name: "MRV Engenharia ON", sector: "Construção Civil" },
  { ticker: "MULT3", name: "Multiplan ON", sector: "Shopping Centers" },
  { ticker: "IGTI11", name: "Iguatemi Unit", sector: "Shopping Centers" },
  { ticker: "ALOS3", name: "Allos (Aliansce Sonae) ON", sector: "Shopping Centers" },

  // Papel, Celulose e Químicos
  { ticker: "SUZB3", name: "Suzano S.A. ON", sector: "Papel e Celulose" },
  { ticker: "KLBN11", name: "Klabin Unit", sector: "Papel e Embalagens" },
  { ticker: "BRKM5", name: "Braskem PNA", sector: "Petroquímica" },

  // Principais ETFs da B3
  { ticker: "BOVA11", name: "iShares Ibovespa Fundo de Índice", sector: "ETF Ibovespa" },
  { ticker: "SMAL11", name: "iShares Small Cap Fundo de Índice", sector: "ETF Small Caps" },
  { ticker: "IVVB11", name: "iShares S&P 500 Fundo de Índice", sector: "ETF S&P 500" },
  { ticker: "HASH11", name: "Hashdex Nasdaq Crypto Index ETF", sector: "ETF Criptoativos" },

  // Principais FIIs (Fundos Imobiliários)
  { ticker: "HGLG11", name: "CSHG Logística FII", sector: "FII Logística" },
  { ticker: "KNIP11", name: "Kinea Índice de Preços FII", sector: "FII Papel" },
  { ticker: "KNCR11", name: "Kinea Rendimentos Imobiliários FII", sector: "FII Papel" },
  { ticker: "MXRF11", name: "Maxi Renda FII", sector: "FII Híbrido" },
  { ticker: "XPML11", name: "XP Malls FII", sector: "FII Shoppings" },
  { ticker: "BTLG11", name: "BTG Pactual Logística FII", sector: "FII Logística" },
  { ticker: "VISC11", name: "Vinci Shopping Centers FII", sector: "FII Shoppings" },
  { ticker: "HGRU11", name: "CSHG Renda Urbana FII", sector: "FII Varejo" },
  { ticker: "CPTS11", name: "Capitânia Securities II FII", sector: "FII Papel" },
];

export function searchB3Stocks(query: string): B3StockItem[] {
  const clean = query.trim().toUpperCase();
  if (!clean) return [];

  return B3_STOCKS.filter(
    (item) =>
      item.ticker.includes(clean) ||
      item.name.toUpperCase().includes(clean) ||
      (item.sector && item.sector.toUpperCase().includes(clean))
  ).slice(0, 6);
}

