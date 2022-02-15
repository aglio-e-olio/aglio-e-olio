import React from "react";
import { useNavigate } from "react-router-dom";
import { v1 as uuid } from "uuid";
import "./CreateRoom.css";

const CreateRoom = (props) => {
    const navigate = useNavigate();
    function create() {
        const id = uuid();
        navigate(`/room/${id}`);
    }

    return (
        <button className="create-room-button" onClick={create}>Create Room</button>
    );
}

export default CreateRoom;