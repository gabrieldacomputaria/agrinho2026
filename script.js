// ==========================================================================
// Seleção de Elementos do DOM
// ==========================================================================
const tractor = document.querySelector('.tractor');
const gameBox = document.querySelector('.game-box');
const scoreElement = document.getElementById('pontuacao');
const restartButton = document.getElementById('restartButton');
const gameOverPanel = document.querySelector('.game-over');

// ==========================================================================
// Variáveis de Estado do Jogo
// ==========================================================================
let isJumping = false;
let isGameOver = false;
let score = 0;
let obstacleTimer = null;
let activeIntervals = []; // Guarda os intervalos dos obstáculos para limpá-los no Game Over

// ==========================================================================
// Lógica da Calculadora de Defensivos
// ==========================================================================
function calcular() {
    const area = parseFloat(document.getElementById('area').value);
    const dosagem = parseFloat(document.getElementById('dosagem').value);
    const resultDiv = document.getElementById('resultado');

    if (area > 0 && dosagem > 0) {
        const total = area * dosagem;
        resultDiv.innerHTML = `Você precisará de <strong>${total.toFixed(2)} Litros</strong> de produto para cobrir ${area} hectares. <br> <small style="color: #666;">Siga sempre o receituário agronômico!</small>`;
    } else {
        resultDiv.innerHTML = "<span style='color: var(--laranja-terra);'>Por favor, preencha os valores corretamente com números maiores que zero.</span>";
    }
}

// ==========================================================================
// Mecânica do Jogo do Trator
// ==========================================================================

// Função de Pulo (Animação de Subida e Descida)
function jump() {
    if (isJumping || isGameOver) return;
    isJumping = true;
    let position = 0;

    // Ciclo de Subida
    const upInterval = setInterval(() => {
        if (position >= 130) { // Altura máxima do pulo
            clearInterval(upInterval);
            
            // Ciclo de Descida
            const downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                    tractor.style.bottom = '0px';
                } else {
                    position -= 6; // Velocidade de descida
                    tractor.style.bottom = position + 'px';
                }
            }, 12);
        } else {
            position += 8; // Velocidade de subida
            tractor.style.bottom = position + 'px';
        }
    }, 12);
}

// Geração e Movimentação de Obstáculos
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    // Alterna aleatoriamente entre o emoji de trigo e milho
    obstacle.classList.add(Math.random() > 0.5 ? 'wheat' : 'corn');
    
    let obstaclePosition = 100; // Começa no canto direito (100%)
    obstacle.style.left = obstaclePosition + '%';
    gameBox.appendChild(obstacle);

    const moveInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(moveInterval);
            return;
        }

        obstaclePosition -= 1.5; // Velocidade do obstáculo correndo a tela
        obstacle.style.left = obstaclePosition + '%';

        // Se o obstáculo passou da tela com sucesso (Pontua)
        if (obstaclePosition < -5) {
            clearInterval(moveInterval);
            if (obstacle.parentNode) {
                obstacle.remove();
            }
            score += 10;
            scoreElement.textContent = score;
            return;
        }

        // Detecção de Colisão Avançada
        const tractorBottom = parseFloat(tractor.style.bottom) || 0;
        
        // hitboxes baseadas na porcentagem da tela (X) e pixels (Y)
        const colisãoX = obstaclePosition > 5 && obstaclePosition < 15;
        const colisãoY = tractorBottom < 35; 

        if (colisãoX && colisãoY) {
            endGame();
            clearInterval(moveInterval);
        }
    }, 20);

    // Salva o intervalo para limpeza posterior
    activeIntervals.push(moveInterval);

    // Tempo aleatório para gerar o próximo obstáculo (entre 1.5s e 3s)
    const nextSpawnDelay = 1500 + Math.random() * 1500;
    obstacleTimer = setTimeout(createObstacle, nextSpawnDelay);
}

// Finalização do Jogo
function endGame() {
    isGameOver = true;
    gameOverPanel.classList.add('visible');
    clearTimeout(obstacleTimer);
    
    // Para todos os movimentos de obstáculos ativos
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];

    // Remove os obstáculos visualmente da tela
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
}

// Reinicialização do Jogo
function restartGame() {
    isGameOver = false;
    score = 0;
    scoreElement.textContent = score;
    gameOverPanel.classList.remove('visible');
    tractor.style.bottom = '0px';
    isJumping = false;
    
    // Limpa resquícios de timers antigos por segurança
    clearTimeout(obstacleTimer);
    activeIntervals.forEach(interval => clearInterval(interval));
    activeIntervals = [];
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    // Reinicia o fluxo de obstáculos
    createObstacle();
}

// ==========================================================================
// Eventos e Inicialização
// ==========================================================================

// Captura do teclado para o pulo (Espaço ou Seta para Cima)
document.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        // Evita que a barra de espaço role a página do navegador para baixo
        event.preventDefault(); 
        jump();
    }
});

// Clique no botão de reiniciar
restartButton.addEventListener('click', restartGame);

// Inicia o primeiro obstáculo ao carregar a página
createObstacle();