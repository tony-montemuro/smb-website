/* ===== IMPORTS ===== */
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Stats.module.css";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";
import LevelHelper from "../../../helper/LevelHelper.js";

function Records({ rankings, game, version }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[3];
  const category = path[4];
  const type = path[5];
  const isLatestVersion = !version || version.id === game.versions?.at(-1).id;

  /* ===== FUNCTIONS ===== */
  const { capitalize, recordB2F, dateB2F } = FrontendHelper();
  const { levelB2F } = LevelHelper();

  /* ===== RECORDS COMPONENT ===== */
  return (
    <div className={ styles.records }>
      <h2>Best { capitalize(type) }s</h2>

      { /* For each mode, render a rankings table */ }
      { Object.keys(rankings).map(mode => {
        return (
          <Fragment key={ mode }>
            <h3>{ levelB2F(mode) }</h3>
            <div className="table">
              <table key={ mode }>

                { /* Table Header - shows what information is rendered in each cell */ }
                <thead>
                  <tr>
                    <th className={ styles.name }>Level Name</th>
                    <th className={ styles.record }>{ capitalize(type) }</th>
                    <th className={ styles.position }>Position</th>
                    <th className={ styles.date }>Date</th>
                  </tr>
                </thead>

                { /* Table body - Renders the information itself */ }
                <tbody>
                  { rankings[mode].map(row => {
                    let levelUrl = `/games/${ abb }/${ category }/${ type }/${ row.level.name }`;
                    if (!isLatestVersion) {
                      levelUrl += `?version=${ version.version }`;
                    }

                    return (
                      <tr key={ row.level.name }>
                        <td className={ styles.name }>
                          <Link to={ levelUrl }>
                            <FancyLevel level={ row.level.name } />
                          </Link>
                        </td>
                        <td className={ styles.record }>{ row.record && recordB2F(row.record, type, row.level.timer_type) }</td>
                        <td className={ styles.position }>{ row.position }</td>
                        <td className={ styles.date }>{ row.date ? dateB2F(row.date) : row.date }</td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Records;