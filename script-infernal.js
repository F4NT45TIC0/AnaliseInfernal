// Configuração do Firebase (usando o mesmo projeto, mas uma coleção diferente)
const firebaseConfig = {
    apiKey: "AIzaSyB2xs_gWVC_Jct7DQdaqnPUfikGoNyciG8",
    authDomain: "analiseinfernal.firebaseapp.com",
    projectId: "analiseinfernal",
    storageBucket: "analiseinfernal.appspot.com",
    messagingSenderId: "310906192422",
    appId: "1:310906192422:web:27bb2e4b85d7225fee5ce7",
    measurementId: "G-7M7498856M"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const integrantes = [
    "Carro", "Kempe", "João Preto", "Roliovos", "Anderson",
    "Antunes", "Shark", "Destro", "Diogo", "Toffani",
    "Rós", "Malaquias", "Murilo", "ViniLuz", "Calegom",
    "Pedro", "Marcondes", "Arthur", "Italo", "Leo Caverna",
    "Tavares"
];

const perguntas = [
    "Caso ocorresse uma troca de Sexo quem você comeria sem pensar duas vezes?",
    "Se você fosse fazer um vídeo pornô qual ex você escolheria para ser sua parceira(o)?",
    "Se você tivesse em uma situação de vida ou morte e o único jeito de sair vivo seria comendo seu amigo quem você comeria?",
    "Quem tem a maior chance de abrir um OF e ficar famoso?",
    "Quem tem cara de ser mais submisso da Hora do Sexo?",
    "Quem tem cara de ser mais Masoquista na Hora do Sexo?",
    "Quem aceitaria um fio terra?",
    "Quem seria mais provável a ter uma troca de casal só pela experiencia?",
    "Quem seria o mais provável a cometer traição de forma consciente?"
];

let currentQuestionIndex = 0;
let respostas = {};

// Inicializar a aplicação
window.onload = () => {
    // A página inicial já mostra os botões de escolha
};

// Funções de navegação
function showSurvey() {
    document.querySelector('.button-container').style.display = 'none';
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';
    showQuestion(currentQuestionIndex);
}

function showResults() {
    document.querySelector('.button-container').style.display = 'none';
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    loadResults();
}

function goBack() {
    document.querySelector('.button-container').style.display = 'flex';
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'none';
    currentQuestionIndex = 0;
    respostas = {};
}

function showQuestion(index) {
    const questionContainer = document.getElementById('current-question');
    const optionsContainer = document.getElementById('options-container');
    const prevButton = document.getElementById('prev-btn');
    
    prevButton.style.visibility = index === 0 ? 'hidden' : 'visible';
    
    questionContainer.textContent = perguntas[index];
    optionsContainer.innerHTML = '';
    
    integrantes.forEach(integrante => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = integrante;
        button.onclick = () => selectOption(integrante);
        optionsContainer.appendChild(button);
    });

    const previousAnswer = respostas[index];
    if (previousAnswer) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === previousAnswer) {
                btn.classList.add('selected');
            }
        });
    }
}

function selectOption(escolha) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === escolha) {
            btn.classList.add('selected');
        }
    });
    
    respostas[currentQuestionIndex] = escolha;
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

function nextQuestion() {
    if (!respostas[currentQuestionIndex]) {
        alert('Por favor, selecione uma opção!');
        return;
    }

    if (currentQuestionIndex === perguntas.length - 1) {
        submitRespostas();
    } else {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

function submitRespostas() {
    // Salvar na coleção específica da versão infernal
    db.collection('respostas-infernal').add({
        respostas: respostas,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
        loadResults();
    })
    .catch(error => {
        console.error("Erro ao salvar respostas:", error);
        alert('Erro ao salvar respostas. Tente novamente.');
    });
}

function loadResults() {
    const chartsContainer = document.getElementById('charts-container');
    chartsContainer.innerHTML = '<h3>Carregando resultados...</h3>';
    
    perguntas.forEach((pergunta, index) => {
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-wrapper';
        
        const title = document.createElement('h3');
        title.textContent = `${index + 1}. ${pergunta}`;
        title.style.color = '#ff4444';
        chartWrapper.appendChild(title);
        
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        chartsContainer.appendChild(chartWrapper);
        
        // Cores únicas para cada integrante
        const cores = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF5733', '#33FF57', '#338AFF', '#FF33FF',
            '#33FFFF', '#FFB533', '#B533FF', '#33FFB5', '#FF3366',
            '#66FF33', '#3366FF', '#FF6633', '#33FFF9', '#F933FF',
            '#FF3333'
        ];
        
        // Buscar dados do Firebase para esta pergunta da coleção infernal
        db.collection('respostas-infernal').get().then((querySnapshot) => {
            const respostasCount = {};
            integrantes.forEach(i => respostasCount[i] = 0);
            
            querySnapshot.forEach((doc) => {
                const resposta = doc.data().respostas[index];
                if (resposta) {
                    respostasCount[resposta]++;
                }
            });

            // Filtrar apenas respostas com contagem > 0
            const filteredData = Object.entries(respostasCount)
                .filter(([_, count]) => count > 0)
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
            
            new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(filteredData),
                    datasets: [{
                        data: Object.values(filteredData),
                        backgroundColor: cores.slice(0, Object.keys(filteredData).length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            top: 0,
                            bottom: 0
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right',
                            align: 'center',
                            labels: {
                                color: 'white',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                padding: 20,
                                boxWidth: 30,
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = ((value * 100) / total).toFixed(1);
                                            return {
                                                text: `${label} (${percentage}%)`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        }
                    }
                }
            });
        });
    });
}
