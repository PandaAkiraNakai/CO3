const flagContext = require.context('../res/flags-png-hd', false, /\.png$/);

export const getFlagImage = (iso) => {
  try {
    return flagContext(`./${iso}.png`);
  } catch {
    return null; // no flag for this code
  }
};