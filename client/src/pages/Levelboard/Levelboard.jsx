// styling
import "./levelboard.css";

// js imports
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import LevelboardInit from "./LevelboardInit";
import Board from "./Board";
import FrontendHelper from "../../helper/FrontendHelper";
import Popup from "./Popup";

function Levelboard({ isMod }) {
	// hooks and functions from init file
	const { 
		loading,
		recordsLoading,
		game,
		records,
		monkeys,
		adjacent,
		formValues,
		formErrors,
		currentUserSubmission,
		boardState,
		popup,
		isSubmit,
		setLoading,
		setBoardState,
		setPopup,
		setIsSubmit,
		checkPath,
		queryMonkey,
		querySubmissions,
		getAdjacentLevelIds,
		submit,
		handleChange,
		handleSubmit
	} = LevelboardInit();

	// code that is executed upon page load, or when the URL is changed using next/previous buttons
	const location = useLocation();
	useEffect(() => {
		setLoading(true);
		checkPath();
		queryMonkey();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	// code that is executed once the path is verfied to be accurate
	useEffect(() => {
		if (game) {
			querySubmissions();
			getAdjacentLevelIds();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game]);

	// code that is executed when both queries are finished and data is collected
	useEffect(() => {
		if (!recordsLoading && adjacent) {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recordsLoading, adjacent]);

	// code that is executed when a user attempts to submit a run
	useEffect(() => {
		// if there are no errors, and isSubmit is set to true, then submit the form values
		// to database
		if (Object.keys(formErrors).length === 0 && isSubmit) {
			submit();
		} else {
			setIsSubmit(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formErrors]);

	// Helper functions
	const { capitalize, cleanLevelName } = FrontendHelper();

	// our main page component
	return (
		<div className="levelboard">
			{loading ? 
			<p>Loading...</p> 
			:
			<>
			<div className="levelboard-header">
				<div className="levelboard-title">
					{ adjacent.prev ?
						<Link to={`/games/${ game.abb }/${ game.category }/${ game.mode }/${ adjacent.prev }`}>
							<button disabled={ isSubmit }>←Prev</button>
						</Link>
					:	
						""
					}
					<h1>{ capitalize(game.mode) }: { cleanLevelName(game.levelName) }</h1>
					{ adjacent.next ?
						<Link to={`/games/${ game.abb }/${ game.category }/${ game.mode }/${ adjacent.next }`}>
							<button disabled={ isSubmit }>Next→</button>
						</Link>
					:
						""
					}
				</div>
				<div className="levelboard-buttons">
				<Link to={ `/games/${ game.abb }` }>
					<button disabled={ isSubmit }>Back to Level Select</button>
				</Link>
				<Link to={ `/games/${ game.abb }/${ game.category }/totalizer`}>
					<button disabled={ isSubmit }>Totalizer Table</button>
				</Link>
				<Link to={ `/games/${ game.abb }/${ game.category }/medals`}>
					<button disabled={ isSubmit }>Medal Table</button>
				</Link>
				<label htmlFor="showLive">Show non-live runs: </label>
				<input
					id="showLive"
					type="checkbox"
					checked={ boardState === "all" ? true : false }
					onChange={ () => setBoardState(boardState === "live" ? "all" : "live") }
					disabled={ isSubmit }
				/>
				</div>
			</div>
			<Board game={ game } records={ records } state={ boardState } isMod={ isMod }/>
			{ supabase.auth.user() ?
			<div className="levelboard-submit">
				<h2>Submit a { capitalize(game.mode) }:</h2>
				<form onSubmit={ handleSubmit }>
					<label htmlFor="record">{ capitalize(game.mode) }: </label>
					<input 
						id="record"
						type="number"
						value={ formValues.record }
						onChange={ handleChange }
					/>
					<p>{ formErrors.record }</p>
					<label htmlFor="monkeyId">Monkey: </label>
					<select 
						id="monkeyId"
						value={ formValues.monkeyId }
						onChange={ handleChange }
					>
						{monkeys.map((monkey) => (
							<option key={ monkey.id } value={ monkey.id }>{ monkey.monkey_name }</option>
						))}
					</select>
					<br />
					<label htmlFor="proof">Proof: </label>
					<input 
						id="proof"
						type="url"
						value={ formValues.proof }
						onChange={ handleChange }
					/>
					<p>{ formErrors.proof }</p>
					<label htmlFor="isLive">Live Run: </label>
					<input
						id="isLive"
						type="checkbox"
						checked={ formValues.isLive }
						onChange={ handleChange }
					/>
					<label htmlFor="comment">Comment (optional): </label>
					<input 
						id="comment"
						type="text"
						value={ formValues.comment }
						onChange={ handleChange }
					/>
					<p>{ formErrors.comment }</p>
					<button disabled={ isSubmit }>Submit</button>
				</form>
				{ currentUserSubmission.user_id ? 
					<button disabled={ isSubmit } onClick={ () => setPopup(true) }>Remove Record</button>
				:
					""
				}
				<Popup trigger={ popup } setTrigger={ setPopup } recordInfo={ currentUserSubmission } />
			</div>
			:
			""
			}
			</> 
			}
		</div>
	);
};

export default Levelboard;