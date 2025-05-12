import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import pb from "./pocketbase"; // pretpostavljam da si ovdje eksportao pb instancu

export default function Register() {

    const navigate = useNavigate();
    const [result, setResult] = createSignal(null);

    async function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            // Kreiraj novog korisnika
            await pb.collection("users").create({
                email: email,
                password: password,
                passwordConfirm: password,
            });

            setResult("Registracija je uspjela.");
            navigate("/Login", { replace: true });
        } catch (error) {
            console.error("Greška:", error);
            if (error?.response?.data?.email) {
                setResult("E-mail adresa je već registrirana.");
            } else {
                setResult("Dogodila se greška prilikom registracije.");
            }
        }
    }

    return (
        <form onSubmit={formSubmit}>
            <div class="flex flex-col items-center justify-center min-h-screen bg-gray-800">
                <div class="p-8 bg-gray-900 rounded-2xl shadow-lg max-w-sm w-full">
                    <h2 class="text-3xl font-semibold text-center text-white mb-6">Registracija</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        required
                        class="border-2 border-gray-300 p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Lozinka"
                        name="password"
                        required
                        class="border-2 border-gray-300 p-3 mb-6 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <p class="text-sm font-light text-white">
                        Već imate račun?{" "}
                        <A
                            href="/Login"
                            class="text-white hover:text-info font-medium hover:underline"
                        >
                            Prijavite se ovdje.
                        </A>
                    </p>

                    <div class="p-2">
                        <input
                            type="submit"
                            value="Registriraj se"
                            class="mt-5 bg-yellow-500 text-black p-3 w-full rounded-lg hover:bg-yellow-600 transition duration-300"
                        />
                    </div>

                    {result() && (
                        <div class="text-white mt-4 text-center">{result()}</div>
                    )}
                </div>
            </div>
        </form>
    );
}
