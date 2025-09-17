/**
 * 미로 생성을 위한 유틸리티 클래스
 * 깊이 우선 탐색(DFS) 알고리즘을 사용하여 랜덤 미로를 생성합니다.
 */
export class MazeGenerator {
    constructor(size) {
        if (size % 2 === 0) size++; // 크기는 항상 홀수여야 함
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(1)); // 1 = 벽
    }

    /**
     * 미로 생성을 시작합니다.
     * @returns {Array<Array<number>>} 생성된 미로 데이터 (0: 통로, 1: 벽)
     */
    generate() {
        this.carvePassages(1, 1);
        
        // 입구와 출구 설정
        this.grid[1][0] = 0; // 입구
        this.grid[this.size - 2][this.size - 1] = 0; // 출구

        return this.grid;
    }

    /**
     * 재귀적으로 통로를 만듭니다.
     * @param {number} cx - 현재 x 좌표
     * @param {number} cy - 현재 y 좌표
     */
    carvePassages(cx, cy) {
        this.grid[cy][cx] = 0; // 현재 위치를 통로로 변경

        const directions = this.shuffleDirections();

        for (const direction of directions) {
            const [dx, dy] = direction;
            const nx = cx + dx * 2;
            const ny = cy + dy * 2;

            if (this.isWithinBounds(nx, ny) && this.grid[ny][nx] === 1) {
                this.grid[cy + dy][cx + dx] = 0; // 중간 벽 허물기
                this.carvePassages(nx, ny);
            }
        }
    }

    /**
     * 이동 방향을 랜덤하게 섞습니다.
     * @returns {Array<Array<number>>} 랜덤하게 섞인 방향 배열
     */
    shuffleDirections() {
        const directions = [
            [1, 0],  // 동
            [-1, 0], // 서
            [0, 1],  // 남
            [0, -1]  // 북
        ];
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        return directions;
    }

    /**
     * 좌표가 미로 범위 내에 있는지 확인합니다.
     * @param {number} x - x 좌표
     * @param {number} y - y 좌표
     * @returns {boolean} 범위 내에 있으면 true
     */
    isWithinBounds(x, y) {
        return y >= 0 && y < this.size && x >= 0 && x < this.size;
    }
}
