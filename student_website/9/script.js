document.addEventListener('DOMContentLoaded', () => {

    // --- 데이터 설정 부분 --- 
    // 나중에 이곳에 있는 사진, 유튜브 주소를 원하는 것으로 바꿀 수 있어요.
    const contentData = [
        {
            type: 'photo',
            thumb: 'https://placehold.co/150x150/a3c4f3/000000?text=Photo+1',
            url: 'https://placehold.co/800x600/f0f0f0/000000?text=ILLIT+Photo+1',
            title: '단체사진 1'
        },
        {
            type: 'photo',
            thumb: 'https://placehold.co/150x150/f3e7a3/000000?text=Photo+2',
            url: 'https://placehold.co/800x600/f0f0f0/000000?text=ILLIT+Photo+2',
            title: '단체사진 2'
        },
        // 원희
        { type: 'video', thumb: 'https://placehold.co/150x150/ffb6c1/000000?text=Wonhee+1', url: 'https://youtube.com/watch?v=G3-iCI6U_CVPPLD24I5IqwmgWzJDXYhZtsqft3TM1VLnVjzWh--BHgsYvT9766BlcbWaWyES8kxDjqlmMbUN0pAq7BjGBefntCtvNFVIHknEp0XwZlmcVV2teBooyi5-VupASRdVc', title: '원희 - jellyous' },
        { type: 'video', thumb: 'https://placehold.co/150x150/ffb6c1/000000?text=Wonhee+2', url: 'https://youtube.com/watch?v=HiwU_0KzePPkwGWdsUMiFIBWeYJUSd0gdXhyDWSuSEn0SfMFLNKwhMGwczcTCQMsixgu0lu0hO7i7G2qc2tHmX7MBxgvjWGO_tHbboKg-tZANDC8vtp7p6vxCyPXIm6g34lp35Myo', title: '원희 - 빌려온 고양이' },
        { type: 'video', thumb: 'https://placehold.co/150x150/ffb6c1/000000?text=Wonhee+3', url: 'https://youtube.com/watch?v=Ht1jXHWGNhDV_lAPU-Cp1YTnP68vTNHoYhW0w8VKI3aHB4Q24_RMtSia63F3i52BiCnM7WwvAHFK_Q8Q8YEPP-yEBslV8cZFw0MzcFR5iDc943hzr6Zmq4JmOwwzQxSLCvK9rcV88', title: '원희 - Cherish' },
        { type: 'video', thumb: 'https://placehold.co/150x150/ffb6c1/000000?text=Wonhee+4', url: 'https://youtube.com/watch?v=Gxkfj6vJnaxYfnB4PQ3KSbNvpR9D8y-S8khgWivfCDMAsGCFcnJhnrBwmeB2JNQn7EYRgemxtw8N6BY1_CC6hYcdYAn6m1B4ULKtCMAdm8N8m7KQ_Dzgk0MRqndwy0VZh_-Z_vwVg', title: '원희 - Almond Chocolate' },
        // 이로하
        { type: 'video', thumb: 'https://placehold.co/150x150/d8bfd8/000000?text=Iroha+1', url: 'https://youtube.com/watch?v=GSWLajo-jYNCN7e9Bus4iyCJGBSWMNE3K43PxMs_vOBi2ATKL4JK9qsO4aX0wppRzulFxD4vCDQvTfkOUrFDILNfnMbU7KeAKXCD3yyRca3848m50BTcEzQNcCeL9Py_QxAm-Yng', title: '이로하 - Cherish' },
        { type: 'video', thumb: 'https://placehold.co/150x150/d8bfd8/000000?text=Iroha+2', url: 'https://youtube.com/watch?v=EVLlDOZTI0XC_39SLDDWLsSZX8uj261ekCM8Z1K-5T-C2a4wwiD4tDRsIlw7Pe3EC5_b6heRfMmQ7oA1-mscPnzOJvoVBQG4r3KoJBWwJ6bgrGmL09fa8_kFc3PDkrNmb4JE7mAw', title: '이로하 - 빌려온 고양이' },
        { type: 'video', thumb: 'https://placehold.co/150x150/d8bfd8/000000?text=Iroha+3', url: 'https://youtube.com/watch?v=pH3fNQj2Qrx1lP5jUXnOEE4uKZOIJSis_KaJmdp3PEVHBDialHgnPp_KdGydhqRCUuI9c5qUvU7RRr_5X_cZ91I0tYYKqmDF6rSxEA0fM9xciK1aBzPDGxiZkMd0fHmHVCDg0ig', title: '이로하 - Magnetic' },
        { type: 'video', thumb: 'https://placehold.co/150x150/d8bfd8/000000?text=Iroha+4', url: 'https://youtube.com/watch?v=EklqqOVZZ19bGiQwEEbiO4mjlrDi12JBJYOMU8VVzINHxOONgA8S4t4uhxunhzqPzoS7L98fZk0xHl1HT2I1pM0FieqoXF3CX2BfXY1tYX-pDeh1iArFXu0QXe66UyBBZZPi_l7Q', title: '이로하 - jellyous' },
        // 민주
        { type: 'video', thumb: 'https://placehold.co/150x150/add8e6/000000?text=Minju+1', url: 'https://youtube.com/watch?v=HLGYv2foLvPkAJPqzsURydCw1uL7lKQv3E2NtieIfgdYPDqJqblU7_m-wz2JqcOUPuKT0cpEpcD9UPwKb4Z6BRSTqILrcpqq3htqSV1EfPu7AV5XTs5b_MeOoX1o0zwLz5ghL_DXY', title: '민주 - 빌려온 고양이' },
        { type: 'video', thumb: 'https://placehold.co/150x150/add8e6/000000?text=Minju+2', url: 'https://youtube.com/watch?v=GQhsA68nwaMCAaiIFCpCd2yETqo3jcSKoUdC3a4uBqQTohOwsQm3u0_KKsu4HaXRbjIRPiHeRRiF7NXoHVpgCzRLqCPUX1MhkKRzcuvYFFtxfYQwYm76D718pNFpLYoK1t-ky32u0', title: '민주 - Cherish' },
        { type: 'video', thumb: 'https://placehold.co/150x150/add8e6/000000?text=Minju+3', url: 'https://youtube.com/watch?v=H2RwvsG_k0OuJSW71Xhw2weJgYi8MposXvWPYPnIznjAXbntFedS9AhUEDqn7rr7fj2Td7woFRdd3jNTmtozchYMV0Hi_DMXlokNwGN4o78oSljMsqXjUjwfTjfsCnDz64fyJxBl8', title: '민주 - jellyous' },
        // 윤아
        { type: 'video', thumb: 'https://placehold.co/150x150/90ee90/000000?text=Yunah+1', url: 'https://youtube.com/watch?v=E42y4UdBK4o23TXKfyfqSAgBIphoX3JU9vhGFqWySOWWYYGEF7en_pEZ5_pnHhT_VyE3CLL6zT8hQDvY8qrpiq3A7ShWtaatc1iygYNYkkqqfYXMOnDN5UBPCN68aFTmfzvjdb8Qg', title: '윤아 - jellyous' },
        { type: 'video', thumb: 'https://placehold.co/150x150/90ee90/000000?text=Yunah+2', url: 'https://youtube.com/watch?v=ETW4rUhigI8hhHuT5AETZ4p4JPrqBg0Zj40xyAJI3F6stkCQfP4Pnbzsglpa-W_-gM2emw60jVUOXwq9GcPhXiDvqG-QfW8dNz0mYLElJPcMlzNwYncDY3FKq_l48ag-vc9ggRhxs', title: '윤아 - Cherish' },
        { type: 'video', thumb: 'https://placehold.co/150x150/90ee90/000000?text=Yunah+3', url: 'https://youtube.com/watch?v=ErgMZnCTNlaCpKAk_kNSJcZidKVh89x86V1d9aDU0cCfBsALNmtfAUF6nHouiEdfxZ3_Pj2oVwM9OycrPQAnBJqNHpCHKTQBWoxZnkyoq87oLBQz3ckmIOUhQtqkNS0acju4ztTgg', title: '윤아 - Magnetic' },
        { type: 'video', thumb: 'https://placehold.co/150x150/90ee90/000000?text=Yunah+4', url: 'https://youtube.com/watch?v=F5xLOQaeag0Lrdxrj6Z_S2UXCRd_XwDYVVrUMyijHyKgZqtlEL4tKFzyKPc-RNoW0nORqfZ4C8gXeIIFlZsMM-JA491fyLRZe3-rauuKJG5Y7PyONcDkAXfbomWLoF8bwRNPlLlYY', title: '윤아 - 빌려온 고양이' },
        { type: 'video', thumb: 'https://placehold.co/150x150/90ee90/000000?text=Yunah+5', url: 'https://youtube.com/watch?v=HcE4TG_M7DlMMk4b0ai4i6M6ITJWlY5EQIV47A9s8cJdsIO_bYEonvH91dJZrItNihyj0mBLwCtmcnAeYrFBRnaJ-HxXtLTK3qPxGNo4mnDa0rWtg9_lgcVrR9euJOLO7Xpa92Wtk', title: '윤아 - Lucky Girl Syndrome' },
        // 모카
        { type: 'video', thumb: 'https://placehold.co/150x150/fffacd/000000?text=Moka+1', url: 'https://youtube.com/watch?v=F35i46e6iH3KD_kixtnB5MTgaKKlWwM1m1J1izYJpcgJvd6IOdFBIkCafLS4Gn2qpkJBBVby1oLcPZpKJBu3VVuK8OIEpB7kUnRH9jEJ7dgSw7_jEGPMu4mJ0v4j20s6ygKK9GdrQ', title: '모카 - jellyous' },
        { type: 'video', thumb: 'https://placehold.co/150x150/fffacd/000000?text=Moka+2', url: 'https://youtube.com/watch?v=FpPMWLUfp6ElPjip1zlXmS3qyN1sNStNhZSSuTiY3RI9LkXhJrK-VbGdHELv1pvKV_0FziREo8-ixNCFWJpUVpHZTOWRsn3tjAM7fAXouWK2e9olx6DodStGz04NWC8ZFsjIQ1JNU', title: '모카 - 빌려온 고양이' },
        { type: 'video', thumb: 'https://placehold.co/150x150/fffacd/000000?text=Moka+3', url: 'https://youtube.com/watch?v=H9YG-PUJiheIT0bM5mC5JfPuX4lCzS5dPcuhj8NHeE7HWWMeH7jVvQ2LhwLhSTHMIsusrj5ao-b1SzFHtYnx1qV0DKbnsigd0u95QnepX2iDKbgJFO1zXBPcZn0e6QBQJeQZ0z0JM', title: '모카 - jellyous (MPD)' },
        { type: 'video', thumb: 'https://placehold.co/150x150/fffacd/000000?text=Moka+4', url: 'https://youtube.com/watch?v=GC7AWhmc84Ya6ZlZy2yClVUqStdesbLKKVcidzwRfwYiK7dVmA-LTBnjfpP9m7k5huowz9-lxGqczokA-TIOCbEvYiON1AO8B7janVQ6rCZ7lf5y58t4NGMSTr6fLP_YAHnSk6xgs', title: '모카 - Magnetic (UNFILTERED)' },
        { type: 'video', thumb: 'https://placehold.co/150x150/fffacd/000000?text=Moka+5', url: 'https://youtube.com/watch?v=GItaS8v_LbwDYbtsRjJt_vd8SVZpt5A0i3xjvxPIz1ZWKQ4P9_NYjpd3EgaPHjrcEubMBbAAOVUKZEwcnVhCgqxNm5iqtgYQ-Aw6BxV9nz4FLulmCSDRH2FFS5C8EZ8doEFpHhsFA', title: '모카 - Magnetic (MPD)' }
    ];

    // --- 요소 가져오기 ---
    const startScreen = document.getElementById('start-screen');
    const mainScreen = document.getElementById('main-screen');
    const startButton = document.getElementById('start-button');
    const buttonContainer = document.getElementById('button-container');
    const photoModal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalButton = document.querySelector('.close-button');
    const clickSound = document.getElementById('click-sound');

    // --- 이벤트 리스너 설정 ---

    // 시작 버튼 클릭
    startButton.addEventListener('click', () => {
        clickSound.play();
        startScreen.style.display = 'none';
        mainScreen.style.display = 'block';
    });

    // 모달 닫기 버튼 클릭
    closeModalButton.addEventListener('click', () => {
        photoModal.style.display = 'none';
    });

    // 모달 바깥 영역 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target == photoModal) {
            photoModal.style.display = 'none';
        }
    });

    // --- 메인 버튼 생성 ---
    contentData.forEach(item => {
        const button = document.createElement('div');
        button.classList.add('main-button');
        // 나중에 이 아래 주석처리된 부분의 'item.thumb'를 실제 앨범커버나 멤버 사진 주소로 바꾸세요
        button.style.backgroundImage = `url(${item.thumb})`;
        button.title = item.title; // 마우스를 올리면 말풍선으로 이름이 보여요

        button.addEventListener('click', () => {
            clickSound.play();
            if (item.type === 'photo') {
                modalImage.src = item.url;
                photoModal.style.display = 'flex';
            } else if (item.type === 'video') {
                window.open(item.url, '_blank'); // 새 탭에서 유튜브 영상 열기
            }
        });

        buttonContainer.appendChild(button);
    });
});
