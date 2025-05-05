import { createSignal, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import pb from "/services/pocketbase";

export default function Navike() {
    const session = useAuth();
    console.log(session());

    const [success, setSuccess] = createSignal(false);

    async function formSubmit(event) {
        setSuccess(false);

        event.preventDefault();
        const formData = new FormData(event.target);

        const name = formData.get("naziv");
        const description = formData.get("opis");

        try {
            await pb.collection("navike").create({
                naziv: name,
                opis: description,
                author_id: session().model.id, // PB vraća user kao "model", ne "user"
            });

            setSuccess(true);
            event.target.reset();
        } catch (error) {
            console.error("Greška kod unosa u PocketBase:", error);
            alert("Spremanje nije uspjelo.");
        }
    }

    return (
        <>
            <div class="min-h-screen flex items-center justify-center bg-gray-900">
                <div class="p-8 bg-gray-800 rounded-2xl shadow-lg max-w-md w-full">
                    <h2 class="text-3xl font-semibold text-center text-white mb-6">Dodaj navike</h2>

                    <form onSubmit={formSubmit}>
                        <div class="flex flex-col mb-4">
                            <label class="text-lg text-white">Naziv:</label>
                            <input
                                name="naziv"
                                type="text"
                                required
                                class="border-2 border-gray-600 bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div class="flex flex-col mb-6">
                            <label class="text-lg text-white">Opis:</label>
                            <input
                                name="opis"
                                type="text"
                                required
                                class="border-2 border-gray-600 bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div class="flex justify-center mb-4">
                            <input
                                type="submit"
                                value="Dodaj naviku"
                                class="bg-yellow-500 text-black p-3 rounded-lg w-full hover:bg-yellow-600 transition duration-300"
                            />
                        </div>
                        <a href="/Home">
                            <button class="bg-red-600 text-white p-3 rounded-lg w-full hover:bg-red-700 transition duration-300">
                                Vrati se na početnu
                            </button>
                        </a>
                    </form>
                    <Show when={success()}>
                        <div class="bg-green-400 text-white p-2 rounded my-5">
                            Navika uspješno dodana!
                        </div>
                    </Show>
                </div>
            </div>
        </>
    );
}
