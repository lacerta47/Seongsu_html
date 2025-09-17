/**
 * 사용자 입력(키보드, 마우스, 조이스틱)을 처리하는 클래스
 */
export class Controls {
    constructor(camera, joystickElement) {
        this.camera = camera;
        this.joystickElement = joystickElement;
        this.isPointerLocked = false;

        // 이동 상태
        this.moveState = { 
            forward: 0, 
            backward: 0, 
            left: 0, 
            right: 0 
        };
        this.run = false;

        // 조이스틱 상태
        this.joystick = {
            active: false,
            initial: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
            delta: { x: 0, y: 0 },
            radius: joystickElement.parentElement.offsetWidth / 2,
        };

        this.init();
    }

    init() {
        // PC 컨트롤 (키보드)
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // PC 컨트롤 (마우스)
        document.body.addEventListener('click', () => {
            if (!this.isPointerLocked) document.body.requestPointerLock();
        });
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
        });
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // 모바일 컨트롤 (조이스틱)
        const joystickContainer = this.joystickElement.parentElement;
        joystickContainer.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
        joystickContainer.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
        joystickContainer.addEventListener('touchend', (e) => this.onJoystickEnd(e));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveState.forward = 1; break;
            case 'KeyS': case 'ArrowDown': this.moveState.backward = 1; break;
            case 'KeyA': case 'ArrowLeft': this.moveState.left = 1; break;
            case 'KeyD': case 'ArrowRight': this.moveState.right = 1; break;
            case 'ShiftLeft': this.run = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': case 'ArrowUp': this.moveState.forward = 0; break;
            case 'KeyS': case 'ArrowDown': this.moveState.backward = 0; break;
            case 'KeyA': case 'ArrowLeft': this.moveState.left = 0; break;
            case 'KeyD': case 'ArrowRight': this.moveState.right = 0; break;
            case 'ShiftLeft': this.run = false; break;
        }
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        this.camera.rotation.y -= movementX * 0.002;
        // Y축 회전(위아래)은 약간의 제약을 둡니다.
        const newRotationX = this.camera.rotation.x - movementY * 0.002;
        if (Math.abs(newRotationX) < Math.PI / 2) {
            this.camera.rotation.x = newRotationX;
        }
    }

    // --- 조이스틱 핸들러 ---
    onJoystickStart(event) {
        event.preventDefault();
        this.joystick.active = true;
        const touch = event.changedTouches[0];
        this.joystick.initial.x = touch.clientX;
        this.joystick.initial.y = touch.clientY;
    }

    onJoystickMove(event) {
        if (!this.joystick.active) return;
        event.preventDefault();
        const touch = event.changedTouches[0];
        this.joystick.current.x = touch.clientX;
        this.joystick.current.y = touch.clientY;

        let deltaX = this.joystick.current.x - this.joystick.initial.x;
        let deltaY = this.joystick.current.y - this.joystick.initial.y;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > this.joystick.radius) {
            deltaX = (deltaX / distance) * this.joystick.radius;
            deltaY = (deltaY / distance) * this.joystick.radius;
        }

        this.joystickElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        this.joystick.delta.x = deltaX / this.joystick.radius;
        this.joystick.delta.y = deltaY / this.joystick.radius;

        // 조이스틱 입력을 moveState에 반영
        this.moveState.forward = Math.max(0, -this.joystick.delta.y);
        this.moveState.backward = Math.max(0, this.joystick.delta.y);
        this.moveState.right = Math.max(0, this.joystick.delta.x);
        this.moveState.left = Math.max(0, -this.joystick.delta.x);
    }

    onJoystickEnd(event) {
        this.joystick.active = false;
        this.joystickElement.style.transform = `translate(0px, 0px)`;
        // 모든 움직임 상태 초기화
        Object.keys(this.moveState).forEach(k => this.moveState[k] = 0);
    }
}
