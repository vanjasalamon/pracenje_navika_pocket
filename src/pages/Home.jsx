import { createSignal, onMount, For, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "/services/pocketbase";

export default function Home(){
    return (
        <div class="text-3xl font-mono font-bold p-2">Prijavite se na događaj</div>

    );
}

