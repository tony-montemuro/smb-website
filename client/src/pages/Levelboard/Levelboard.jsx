import "./levelboard.css";
import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DeletePopup from "./DeletePopup";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardInit from "./LevelboardInit";
import ReportPopup from "./ReportPopup";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import { UserContext } from "../../App";

function Levelboard({ cache }) {
	// user state from user context
  const { user } = useContext(UserContext);

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
		generateGame,
		generateLevelboard,
		handleChange,
		setBoardReport,
		setBoardDelete,
		submitRecord
	} = LevelboardInit();

	// helper functions
	const { capitalize, cleanLevelName, dateB2F, recordB2F } = FrontendHelper();

	// code that is executed upon page load, or when the URL is changed using next/previous buttons
	const location = useLocation();
	useEffect(() => {
		reset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	// code that is executed when page is loading, or when the cache fields are updated
	useEffect(() => {
		if (loading && cache.games && cache.levels && user.id !== undefined) {
			// if game is undefined, terminate page load
			const game = generateGame(cache.games, cache.levels);
			if (game) {
				generateLevelboard(game, cache.submissionReducer, user);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, cache.games, cache.levels, user]);

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
							{ game.adjacent.prev ?
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.type }/${ game.adjacent.prev }` }>
									<button disabled={ form.submitting }>←Prev</button>
								</Link>
							:	
								null
							}
							<h1>{ capitalize(game.type) }: { cleanLevelName(game.level) }</h1>
							{ game.adjacent.next ?
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.type }/${ game.adjacent.next }` }>
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
								<Link to={ `/games/${ game.abb }/${ game.category }/${ game.other }/${ game.level }` }>
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
									<th>Region</th>
									<th>Monkey</th>
									<th>Proof</th>
									<th>Comment</th>
									<th>Approved</th>
									<th>Report</th>
									{ user.is_mod ? <th>Delete</th> : null }
								</tr>
							</thead>
							<tbody>
							{ board.records[board.state].map((val) => {
								return <tr key={ `${ val.user.username }-row` }>
										<td>{ val.details.position }</td>
										<td>
											<div className="levelboard-user-info">
												<div className="levelboard-user-image" style={ { width: imgLength, height: imgLength } }>
													<SimpleAvatar url={ val.user.avatar_url } size={ imgLength } imageReducer={ cache.imageReducer } />
												</div>
													{ val.user.country ?
														<div><span className={ `fi fi-${ val.user.country.toLowerCase() }` }></span></div>
													:
														null
												}
												<div><Link to={ `/user/${ val.user.id }` }>{ val.user.username }</Link></div>
											</div>
										</td>
										<td>{ recordB2F(val.details.record, game.type) }</td>
										<td>{ dateB2F(val.details.submitted_at) }</td>
										<td>{ val.details.region.region_name }</td>
										<td>{ val.details.monkey.monkey_name }</td>
										<td>{ val.details.proof !== "none" ? <a href={ val.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>
										<td>{ val.details.comment }</td>
										<td>{ val.approved ? "True" : "False" }</td>
										<td>
											<button 
												onClick={ () => setBoardReport(val.user.id) }
												disabled={ user.id && user.id === val.user.id }
											>
												📝
											</button>
										</td>
										{ user.is_mod ? <td><button onClick={ () => setBoardDelete(val.user.id) }>❌</button></td> : null }
									</tr>
								})}
							</tbody>
						</table>
					</div>
					{ user.id ?
						<div className="levelboard-submit">
							<h2>Submit a { capitalize(game.type) }:</h2>
							<form onSubmit={ (e) => submitRecord(e, user) }>
								{ user.is_mod ?
									<div className="levelboard-input-group">
										<label htmlFor="user_id">User: </label>
										<select id="user_id" value={ form.values.user_id } onChange={ handleChange }>
											{ cache.profiles.map((profile) => (
												<option key={ profile.id } value={ profile.id }>{ profile.username }</option>
											))}
										</select>
									</div>
								:
									null
								}
								<div className="levelboard-input-group">
									<label htmlFor="record">{ capitalize(game.type) }: </label>
									<input 
										id="record"
										type="number"
										value={ form.values.record }
										onChange={ handleChange }
										disabled={ user.id !== form.values.user_id && board.records.all.some(row => row.user.id === form.values.user_id) }
									/>
									{ form.error.record ? <p>{ form.error.record }</p> : null }
								</div>
								<div className="levelboard-input-group">
									<label htmlFor="submitted_at">Date: </label>
									<input 
										id="submitted_at" 
										type="date" 
										min={ game.release_date } 
										max={ dateB2F() }
										value={ form.values.submitted_at }
										onChange={ handleChange }
									/>
								</div>
								<div className="levelboard-input-group">
									<label htmlFor="region_id">Region: </label>
									<select id="region_id" value={ form.values.region_id } onChange={ handleChange }>
										{ form.region.map(region => (
											<option key={ region.id } value={ region.id }>{ region.region_name }</option>
										))}
									</select>
								</div>
								<div className="levelboard-input-group">
									<label htmlFor="monkey_id">Monkey: </label>
									<select id="monkey_id" value={ form.values.monkey_id } onChange={ handleChange }>
										{ form.monkey.map((monkey) => (
											<option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
										))}
									</select>
								</div>
								<div className="levelboard-input-group">
									<label htmlFor="proof">Proof: </label>
									<input 
										id="proof"
										type="url"
										value={ form.values.proof }
										onChange={ handleChange }
									/>
									{ form.error.proof  ? <p>{ form.error.proof }</p> : null }
								</div>
								<div className="levelboard-input-group">
									<label htmlFor="comment">Comment (optional): </label>
									<input 
										id="comment"
										type="text"
										value={ form.values.comment }
										onChange={ handleChange }
										disabled={ user.id !== form.values.user_id }
									/>
									<p>{ form.error.comment }</p>
								</div>
								{ user.id !== form.values.user_id ?
									<div className="levelboard-input-group">
										<label htmlFor="message">Leave a message (optional): </label>
										<input 
											id="message"
											type="text"
											value={ form.values.message }
											onChange={ handleChange }
										/>
										{ form.error.message  ? <p>{ form.error.message }</p> : null }
									</div>
								:
									null
								}
								<div className="levelboard-input-group">
									<label htmlFor="live">Live Run: </label>
									<input
										id="live"
										type="checkbox"
										checked={ form.values.live }
										onChange={ handleChange }
									/>
								</div>
								<button disabled={ form.submitting }>Submit</button>
							</form>
							<DeletePopup board={ board } setBoard={ setBoard } />
							<ReportPopup board={ board } setBoard={ setBoard } moderators={ cache.moderators } />
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