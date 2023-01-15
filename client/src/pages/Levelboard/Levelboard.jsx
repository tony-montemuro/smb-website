import "./levelboard.css";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardInit from "./LevelboardInit";
import Popup from "./Popup";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Levelboard({ cache }) {
	// variables
	const imgLength = 50;

	// hooks and functions from init file
	const { 
		loading,
		game,
		board,
		form,
		setLoading,
		setBoard,
		reset,
		handleChange,
		setBoardDelete,
		submitRecord,
		generateLevelboard
	} = LevelboardInit();

	// helper functions
	const { capitalize, cleanLevelName } = FrontendHelper();

	// code that is executed upon page load, or when the URL is changed using next/previous buttons
	const location = useLocation();
	useEffect(() => {
		reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	// code that is executed when page is loading, or when the cache fields are updated
	useEffect(() => {
		if (loading && cache.games && cache.levels && cache.monkeys) {
			generateLevelboard(cache.games, cache.levels, cache.monkeys, cache.submissionState);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, cache.games, cache.levels, cache.monkeys]);

	// code that is executed once the levelboard has been generated
	useEffect(() => {
		if (board.records && form.monkey) {
			console.log(board);
			console.log(form);
			console.log(game);
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [board.records, form.monkey]);

	// levelboard component
	return (
		<>
			{ loading ? 
				<p>Loading...</p> 
			:
				<>
					<div className="levelboard-header">
						<div className="levelboard-title">
							{ board.adjacent.prev ?
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.type }/${ board.adjacent.prev }` }>
									<button disabled={ form.submitting }>←Prev</button>
								</Link>
							:	
								null
							}
							<h1>{ capitalize(game.type) }: { cleanLevelName(game.levelName) }</h1>
							{ board.adjacent.next ?
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.type }/${ board.adjacent.next }` }>
									<button disabled={ form.submitting }>Next→</button>
								</Link>
							:
								null
							}
						</div>
						<div className="levelboard-buttons">
							<Link to={ `/games/${ game.abb }` }>
								<button disabled={ form.submitting }>Back to Level Select</button>
							</Link>
							{ game.chart_type === "both" ?
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.other }/${ game.levelName }` }>
									<button disabled={ form.submitting }>{ capitalize(game.other) } Board</button>
								</Link>
							:
								null
							}
							<Link to={ `/games/${ game.abb }/${ game.category }/totalizer` }>
								<button disabled={ form.submitting }>Totalizer Table</button>
							</Link>
							<Link to={ `/games/${ game.abb }/${ game.category }/medals` }>
								<button disabled={ form.submitting }>Medal Table</button>
							</Link>
							<label htmlFor="showLive">Live-{ game.type }s only: </label>
							<input
								id="showLive"
								type="checkbox"
								checked={ board.state === "live" ? true : false }
								onChange={ () => setBoard({ ...board, state: board.state === "live" ? "all" : "live" }) }
								disabled={ form.submitting }
							/>
						</div>
					</div>
					<div className="levelboard-container">
						<table>
							<thead>
								<tr>
									<th>Position</th>
									<th>Name</th>
									<th>{ capitalize(game.type) }</th>
									<th>Date</th>
									<th>Monkey</th>
									<th>Proof</th>
									<th>Comment</th>
									<th>Approved</th>
									{ cache.isMod ? <th>Delete</th> : null }
								</tr>
							</thead>
							<tbody>
							{ board.records[board.state].map((val) => {
								return <tr key={ `${ val.profiles.username }-row` }>
										<td>{ val.position }</td>
										<td>
											<div className="levelboard-user-info">
												<div className="levelboard-user-image" style={{ width: imgLength, height: imgLength }}>
													<SimpleAvatar url={ val.profiles.avatar_url } size={ imgLength }/>
												</div>
													{ val.profiles.country ?
														<div><span className={ `fi fi-${ val.profiles.country.toLowerCase() }` }></span></div>
													:
														null
												}
												<div><Link to={ `/user/${ val.profiles.id }` }>{ val.profiles.username }</Link></div>
											</div>
										</td>
										<td>{ val[game.type] }</td>
										<td>{ val.submitted_at.slice(0, 10) }</td>
										<td>{ val.monkey.monkey_name }</td>
										<td>{ val.proof !== "none" ? <a href={ val.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>
										<td>{ val.comment }</td>
										<td>{ val.approved ? "True" : "False" }</td>
										{ cache.isMod ? <td><button onClick={ () => setBoardDelete(val.profiles.id) }>❌</button></td> : null }
									</tr>
								})}
							</tbody>
						</table>
					</div>
					{ supabase.auth.user() ?
						<div className="levelboard-submit">
							<h2>Submit a { capitalize(game.type) }:</h2>
							<form onSubmit={ submitRecord }>
								<label htmlFor={ game.type }>{ capitalize(game.type) }: </label>
								<input 
									id={ game.type }
									type="number"
									value={ form.values[game.type] }
									onChange={ handleChange }
								/>
								<p>{ form.error.record }</p>
								<label htmlFor="monkey">Monkey: </label>
								<select id="monkey_id" value={ form.values.monkey_id } onChange={ handleChange }>
									{ form.monkey.map((monkey) => (
										<option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
									))}
								</select>
								<br />
								<label htmlFor="proof">Proof: </label>
								<input 
									id="proof"
									type="url"
									value={ form.values.proof }
									onChange={ handleChange }
								/>
								<p>{ form.error.proof }</p>
								<label htmlFor="live">Live Run: </label>
								<input
									id="live"
									type="checkbox"
									checked={ form.values.live }
									onChange={ handleChange }
								/>
								<label htmlFor="comment">Comment (optional): </label>
								<input 
									id="comment"
									type="text"
									value={ form.values.comment }
									onChange={ handleChange }
								/>
								<p>{ form.error.comment }</p>
								<button disabled={ form.submitting }>Submit</button>
							</form>
							{ form.prevSubmitted ?
								<button disabled={ form.submitting } onClick={ () => setBoardDelete(supabase.auth.user().id) }>Remove Record</button>
							:
								null
							}
							<Popup board={ board } setBoard={ setBoard } />
						</div>
					:
						null
					}
				</> 
			}
		</>
	);
};

export default Levelboard;