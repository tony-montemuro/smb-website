/* ===== IMPORTS ===== */
import styles from "./Support.module.css";
import PayPal from "../../assets/svg/PayPal.jsx";
import SupportLogic from "./Support.js";
import Venmo from "../../assets/svg/Venmo.jsx";

function Support() {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { onVenmoClick } = SupportLogic();
  
  /* ===== SUPPORT COMPONENT ===== */
  return (
    <div className={ styles.support }>
      <h1>Support</h1>
      <p>SMBElite was initially developed by <strong>TonySMB</strong>, but can only survive with the help of the community. Here are a list of ways to help maintain the website:</p>
      <hr />
      <h2>Become a Site Administrator</h2>
      <p><strong>Site Administrators</strong> are elevated users who help maintain the website with access to special privileges, such as:</p>
      <ul>
        <li>Creating news posts to announce developments within the community</li>
        <li>Adding/removing game moderators</li>
        <li>Adding charts for new Monkey Ball games <em>[Coming Soon]</em></li> 
      </ul>
      <p>Site Administrators are also well-trusted, meaning that changes they suggest are most likely to be implemented.</p>
      <p>To become an adiminstrator, start by offering to moderate at least one game. Develop enough trust over time, and you may earn the privilege of site administrator!</p>
      <hr />
      <h2>Report Issues, or Fix Them Yourself</h2>
      <p>If you are not a developer, feel free to report any issues you find on the website to <strong>TonySMB</strong>. The best way to contact him is through discord (<code>tonysmb</code>). Alternatively, you can send him an email (<code>tonyamontemuro@gmail.com</code>). <em>Please be as specific as possible when describing an issue on the website.</em></p>
      <p>If you are a developer, SMBElite is an open-source application. You can access the website's repository <a href="https://github.com/tony-montemuro/smb-website" target="_blank" rel="noopener noreferrer">here</a>. Feel free to contribute to the repository; any help is greatly appreciated!</p>
      <hr />
      <h2>Make a Donation</h2>
      <p>Any donations to help cover operational costs are greatly appreciated. Please only donate what you can!</p>
      <div className={ styles.payments }>
        <div className={ styles.payment }>
          <a 
            href="https://www.paypal.com/donate/?business=H4PG6V8NLSPC6&no_recurring=0&item_name=Your+donation+keeps+SMBElite+running+%28any+amount+is+appreciated%29&currency_code=USD"
            target="_blank" 
            rel="noopener noreferrer"
          >
            <PayPal />
          </a>
        </div>
        <div className={ styles.payment } onClick={ onVenmoClick }><Venmo /></div>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Support;