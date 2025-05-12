import { createSignal, createEffect, For, onCleanup, onMount } from "solid-js";
import { useAuth } from "./AuthProvider";
import Chart from "chart.js/auto";
import pb from "./pocketbase"; // pretpostavljam da si eksportao PocketBase instancu iz ovog fajla

export default function Pregled() {
    const session = useAuth();
    const [navike, setNavike] = createSignal([]);
    const [completed, setCompleted] = createSignal({});
    const [doneCount, setDoneCount] = createSignal(parseInt(localStorage.getItem("doneCount")) || 0);
    const [canceledCount, setCanceledCount] = createSignal(parseInt(localStorage.getItem("canceledCount")) || 0);
    const [doneClicked, setDoneClicked] = createSignal({});
    const [canceledClicked, setCanceledClicked] = createSignal({});
    let chartRef;
    let chartInstance;

    createEffect(() => {
        loadNavike();
    });

    async function loadNavike() {
        try {
            const data = await pb.collection("navike").getFullList({
                filter: `author_id = "${session().user.id}"`,
            });

            setNavike(data);

            const completedMap = {};
            data.forEach(item => {
                if (item.dovrseno === true) completedMap[item.id] = "done";
                else if (item.dovrseno === false) completedMap[item.id] = "canceled";
            });
            setCompleted(completedMap);
        } catch (error) {
            console.error("Greška pri učitavanju navika:", error);
            alert("Učitavanje navika nije uspjelo.");
        }
    }

    async function markCompleted(id) {
        if (doneClicked()[id] || canceledClicked()[id]) return;

        try {
            await pb.collection("navike").update(id, { dovrseno: true });
            setCompleted(prev => ({ ...prev, [id]: "done" }));
            setDoneCount(prev => {
                const newCount = prev + 1;
                localStorage.setItem("doneCount", newCount);
                return newCount;
            });
            setDoneClicked(prev => ({ ...prev, [id]: true }));
            updateChart();
        } catch (error) {
            console.log("Greška:", error);
        }
    }

    async function markCanceled(id) {
        if (doneClicked()[id] || canceledClicked()[id]) return;

        try {
            await pb.collection("navike").update(id, { dovrseno: false });
            setCompleted(prev => ({ ...prev, [id]: "canceled" }));
            setCanceledCount(prev => {
                const newCount = prev + 1;
                localStorage.setItem("canceledCount", newCount);
                return newCount;
            });
            setCanceledClicked(prev => ({ ...prev, [id]: true }));
            updateChart();
        } catch (error) {
            console.log("Greška:", error);
        }
    }

    async function deleteProject(projectId) {
        try {
            await pb.collection("navike").delete(projectId);
            setNavike(prev => prev.filter(item => item.id !== projectId));
        } catch (error) {
            alert("Operacija nije uspjela.");
        }
    }

    function updateChart() {
        if (chartInstance) {
            chartInstance.data.datasets[0].data = [doneCount(), canceledCount()];
            chartInstance.update();
        }
    }

    onMount(() => {
        if (chartRef) {
            const ctx = chartRef.getContext("2d");
            chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Dovršeno", "Odustano"],
                    datasets: [{
                        label: "Broj navika",
                        data: [doneCount(), canceledCount()],
                        backgroundColor: ["#4CAF50", "#F44336"],
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                            },
                        },
                    },
                },
            });
            onCleanup(() => chartInstance.destroy());
        }
    });

    return (
        <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900">
            <div class="p-8 mt-5 mb-5 bg-gray-800 rounded-2xl shadow-lg max-w-md w-full">
                <h2 class="text-3xl font-semibold text-center text-white mb-6">Vaše navike</h2>
                <ul>
                    <For each={navike()} fallback={<div class="text-gray-400 text-center">Nema navika.</div>}>
                        {(item) => (
                            <li class="relative flex flex-col gap-2 items-start p-4 bg-gray-700 rounded-lg mb-4">
                                <div 
                                    class="absolute top-2 right-2 w-4 h-4 rounded-full transition-colors duration-300"
                                    classList={{
                                        "bg-red-500": completed()[item.id] !== "done",
                                        "bg-green-500": completed()[item.id] === "done"
                                    }}
                                ></div>
                                <div class="font-bold text-lg">{item.naziv}</div>
                                <div>{item.opis}</div>
                                <div class="flex gap-2 mt-2">
                                    {!doneClicked()[item.id] && !canceledClicked()[item.id] && (
                                        <>
                                            <button
                                                class="bg-blue-500 text-white p-2 rounded text-sm"
                                                onClick={() => markCompleted(item.id)}
                                            >
                                                Dovršeno
                                            </button>
                                            <button
                                                class="bg-yellow-500 text-white p-2 rounded text-sm"
                                                onClick={() => markCanceled(item.id)}
                                            >
                                                Odustani
                                            </button>
                                        </>
                                    )}
                                    <button
                                        class="bg-red-500 text-white p-2 rounded text-sm"
                                        onClick={() => deleteProject(item.id)}
                                    >
                                        Obriši
                                    </button>
                                </div>
                            </li>
                        )}
                    </For>
                </ul>
                <a href="/Home">
                    <button class="bg-red-600 text-white p-3 rounded-lg w-full hover:bg-red-700 transition duration-300 mt-4">
                        Vrati se na početnu
                    </button>
                </a>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg shadow-lg mt-6 w-96">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
}
