document.addEventListener('DOMContentLoaded', function () {
    // 화면 요소 가져오기
    const startScreen = document.getElementById('start-screen');
    const mainScreen = document.getElementById('main-screen');
    const startBtn = document.getElementById('start-btn');

    // 제어판 요소 가져오기
    const functionInput = document.getElementById('function-input');
    const plotBtn = document.getElementById('plot-btn');
    const xRangeMin = document.getElementById('x-range-min');
    const xRangeMax = document.getElementById('x-range-max');
    const xMinLabel = document.getElementById('x-min-label');
    const xMaxLabel = document.getElementById('x-max-label');
    const resultsOutput = document.getElementById('results-output');
    const plotDiv = document.getElementById('plot-div');

    // 시작하기 버튼 이벤트
    startBtn.addEventListener('click', () => {
        startScreen.classList.add('d-none');
        mainScreen.classList.remove('d-none');
        // 메인 화면이 표시된 후 그래프를 그립니다.
        drawGraph();
    });

    // 그래프 그리기 버튼 및 슬라이더 이벤트
    plotBtn.addEventListener('click', drawGraph);
    xRangeMin.addEventListener('input', () => {
        xMinLabel.textContent = xRangeMin.value;
        drawGraph();
    });
    xRangeMax.addEventListener('input', () => {
        xMaxLabel.textContent = xRangeMax.value;
        drawGraph();
    });

    // 그래프 그리기 함수
    function drawGraph() {
        try {
            const expr = functionInput.value;
            const node = math.parse(expr);
            const compiled = node.compile();

            const xMin = parseFloat(xRangeMin.value);
            const xMax = parseFloat(xRangeMax.value);
            
            if (xMin >= xMax) {
                resultsOutput.innerHTML = '<div class="alert alert-danger">오류: X축의 최소값이 최대값보다 크거나 같을 수 없습니다.</div>';
                return;
            }

            const xValues = [];
            const yValues = [];
            const step = (xMax - xMin) / 200; // 200개의 점으로 그래프를 부드럽게 만듭니다.

            for (let x = xMin; x <= xMax; x += step) {
                xValues.push(x);
                yValues.push(compiled.evaluate({ x: x }));
            }

            const trace = {
                x: xValues,
                y: yValues,
                mode: 'lines',
                type: 'scatter',
                line: {
                    color: '#0d6efd',
                    width: 3
                }
            };

            const layout = {
                title: `y = ${expr}`,
                xaxis: {
                    title: 'x',
                    gridcolor: '#eee',
                    zerolinecolor: '#969696'
                },
                yaxis: {
                    title: 'y',
                    gridcolor: '#eee',
                    zerolinecolor: '#969696'
                },
                margin: { l: 50, r: 30, b: 50, t: 50 },
                showlegend: false
            };
            
            const config = {
                responsive: true, // 반응형으로 크기 조절
                displaylogo: false, // Plotly 로고 숨기기
                modeBarButtonsToRemove: ['toImage'], // 기본 저장 버튼 제거 (나중에 커스텀 버튼으로 대체 가능)
                modeBarButtonsToAdd: [{
                    name: '이미지로 저장',
                    icon: Plotly.Icons.camera,
                    click: function(gd) {
                        Plotly.downloadImage(gd, {format: 'png', width: 800, height: 600, filename: 'graph'});
                    }
                }]
            };

            Plotly.newPlot(plotDiv, [trace], layout, config);
            resultsOutput.innerHTML = '<small class="text-muted">그래프를 성공적으로 그렸습니다.</small>';

        } catch (err) {
            // 오류 발생 시 사용자에게 알림
            resultsOutput.innerHTML = `<div class="alert alert-danger">오류가 발생했습니다: ${err.message}.<br>함수식을 확인해 주세요. (예: x^2, sin(x))</div>`;
            Plotly.purge(plotDiv); // 오류 시 기존 그래프 삭제
        }
    }
});
