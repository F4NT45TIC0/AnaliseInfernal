// Configuração do Firebase
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

// Configurar persistência offline (opcional, mas ajuda na performance)
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Não foi possível habilitar persistência offline');
        } else if (err.code == 'unimplemented') {
            console.log('O navegador não suporta persistência offline');
        }
    });

const integrantes = [
    "Carro", "Kempe", "João Preto", "Roliovos", "Anderson",
    "Antunes", "Shark", "Destro", "Diogo", "Toffani",
    "Rós", "Malaquias", "Murilo", "ViniLuz", "Calegom",
    "Pedro", "Marcondes", "Arthur", "Italo", "Leo Caverna",
    "Tavares"
];

const perguntas = [
    "Quem tem a maior chance de ser preso?",
    "Quem vai ser pai primeiro?",
    "Quem tem o maior pau?",
    "Quem tem a ex mais gostosa?",
    "Quem é o mais pau no cu?",
    "Quem é mais engraçado?",
    "Quem é o mais chato?",
    "Quem é o mais caverna?",
    "Pegaria a ex de quem?",
    "Quem é o mais provável de se acidentar?",
    "Quem é mais provável apanhar porque deu em cima de muié casada?",
    "Quem é mais provável ter uma overdose?",
    "Quem é o mais provável de ser o mais bem sucedido?",
    "Quem é o mais provável que morrerá por último?",
    "Quem teria um término de casamento por culpa de traição?"
];

let currentQuestionIndex = 0;
let respostas = {};

// Inicializar a aplicação
window.onload = () => {
    // A página inicial já mostra os botões de escolha
};

function showQuestion(index) {
    const questionContainer = document.getElementById('current-question');
    const optionsContainer = document.getElementById('options-container');
    
    questionContainer.textContent = perguntas[index];
    optionsContainer.innerHTML = '';
    
    integrantes.forEach(integrante => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = integrante;
        button.onclick = () => selectOption(integrante);
        optionsContainer.appendChild(button);
    });
}

function selectOption(escolha) {
    // Remover seleção anterior
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent === escolha) {
            btn.classList.add('selected');
        }
    });
    
    respostas[currentQuestionIndex] = escolha;
}

function nextQuestion() {
    if (!respostas[currentQuestionIndex]) {
        alert('Por favor, selecione uma opção!');
        return;
    }

    if (currentQuestionIndex === perguntas.length - 1) {
        // Última pergunta, enviar respostas
        submitRespostas();
    } else {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

function submitRespostas() {
    // Salvar no Firebase
    db.collection('respostas').add({
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
        
        // Buscar dados do Firebase para esta pergunta
        db.collection('respostas').get().then((querySnapshot) => {
            const respostasCount = {};
            integrantes.forEach(i => respostasCount[i] = 0);
            
            querySnapshot.forEach((doc) => {
                const resposta = doc.data().respostas[index];
                if (resposta) {
                    respostasCount[resposta]++;
                }
            });
            
            new Chart(canvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(respostasCount),
                    datasets: [{
                        data: Object.values(respostasCount),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                            '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56',
                            '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
                            '#FFCE56'
                        ]
                    }]
                },                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: 'white',
                                font: {
                                    size: 12
                                },
                                padding: 10
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value * 100) / total).toFixed(1);
                                    return `${label}: ${value} votos (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        });
    });
}

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
    // Resetar o questionário
    currentQuestionIndex = 0;
    respostas = {};
}
