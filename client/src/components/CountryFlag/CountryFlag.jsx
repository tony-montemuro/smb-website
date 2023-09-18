/* ===== IMPORTS ===== */
import "../../../node_modules/flag-icons/css/flag-icons.min.css";

function CountryFlag({ country }) {
  /* ===== VARIABLES ===== */
  let iso2 = null;
  if (country) {
    iso2 = country.iso2 ? country.iso2 : country;
  }

  /* ===== COUNTRY FLAG COMPONENT ===== */
  return iso2 && <span className={ `fi fi-${ iso2.toLowerCase() }` }></span>;
};

/* ===== EXPORTS ===== */
export default CountryFlag;