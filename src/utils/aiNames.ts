// Random AI names for the game
const AI_NAMES = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliet',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'Xray',
  'Yankee',
  'Zulu',
  'Nova',
  'Orion',
  'Atlas',
  'Phoenix',
  'Vega',
  'Polaris',
  'Sirius',
  'Andromeda',
  'Cassiopeia',
  'Cygnus',
  'Draco',
  'Lyra',
  'Pegasus',
  'Perseus'
];

export function getRandomAIName(): string {
  const randomIndex = Math.floor(Math.random() * AI_NAMES.length);
  return AI_NAMES[randomIndex];
} 