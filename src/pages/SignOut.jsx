import { createSignal, onMount, Show } from "solid-js";
import pb from "./pocketbase";

export default function SignOut() {
    const [result, setResult] = createSignal(null);

    onMount(() => {
        try {
            pb.authStore.clear();
            setResult("Odjava je uspjela.");
        } catch (error) {
            console.error("Greška pri odjavi:", error);
            setResult("Odjava nije uspjela!");
        }
    });

    return (
        <>
            <Show when={result()}>
                <div class="bg-slate-300 p-4 rounded">
                    {result()}
                </div>
            </Show>
        </>
    );
}