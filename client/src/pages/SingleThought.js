import React from "react";
// COMPONENTS: ⬇︎ import for id retrieval //Module: 21.4.4
import { useParams } from "react-router-dom";
// COMPONENTS: ⬇︎ import useQuery hook and single thought query from queries.js // Module: 21.4.5
import { useQuery } from "@apollo/client";
import { QUERY_THOUGHT } from "../utils/queries";

import ReactionList from '../components/ReactionList';


const SingleThought = (props) => {
  // COMPONENTS: ⬇︎ retrieve id for single collection so it can be used to dynamically display other info about the collection 𛰧ie. items, comments𛰨 // Module: 21.4.4
  const { id: thoughtId } = useParams();
  console.log(thoughtId);

  const { loading, data } = useQuery(QUERY_THOUGHT, {
    variables: { id: thoughtId },
  });

  const thought = data?.thought || {};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="card mb-3">
        <p className="card-header">
          <span style={{ fontWeight: 700 }} className="text-light">
            {thought.username}
          </span>{" "}
          thought on {thought.createdAt}
        </p>
        <div className="card-body">
          <p>{thought.thoughtText}</p>
        </div>
      </div>

      {thought.reactionCount > 0 && <ReactionList reactions={thought.reactions} />}
    </div>
  );
};

export default SingleThought;
