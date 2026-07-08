// 回線速度テスト — 実測版
// Cloudflare の速度測定エンドポイント (speed.cloudflare.com) に対して
// 実際にデータを送受信して測定します。測定できない場合は結果を偽らず
// エラーを表示します。
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-speed-test');
    const speedGauge = document.getElementById('speed-gauge');
    const speedNumber = document.getElementById('speed-number');
    const speedUnit = document.getElementById('speed-unit');

    const resPing = document.getElementById('res-ping');
    const resDownload = document.getElementById('res-download');
    const resUpload = document.getElementById('res-upload');

    const cardPing = document.getElementById('card-ping');
    const cardDownload = document.getElementById('card-download');
    const cardUpload = document.getElementById('card-upload');
    const statusNote = document.getElementById('speed-status-note');

    const DOWN_URL = (bytes) => `https://speed.cloudflare.com/__down?bytes=${bytes}`;
    const UP_URL = 'https://speed.cloudflare.com/__up';
    const GAUGE_MAX_MBPS = 300;

    let testing = false;

    const setNote = (text) => { if (statusNote) statusNote.textContent = text; };

    const setGauge = (val, max) => {
        const percent = Math.min((val / max) * 100, 100);
        speedGauge.style.setProperty('--percentage', `${percent}%`);
        speedNumber.textContent = val >= 100 ? Math.round(val) : (Math.round(val * 10) / 10);
    };

    const resetUI = () => {
        setGauge(0, 100);
        resPing.textContent = '-';
        resDownload.textContent = '-';
        resUpload.textContent = '-';
    };

    const runPingTest = async () => {
        cardPing.classList.add('active');
        speedUnit.textContent = 'ms';
        setNote('応答速度（Ping）を測定しています…');
        const pings = [];
        // 1回目はコネクション確立を含むため捨てる
        for (let i = 0; i < 6; i++) {
            const start = performance.now();
            const res = await fetch(DOWN_URL(0), { cache: 'no-store' });
            await res.arrayBuffer();
            const rtt = performance.now() - start;
            if (i > 0) pings.push(rtt);
            setGauge(rtt, 200);
            resPing.textContent = Math.round(rtt);
        }
        pings.sort((a, b) => a - b);
        const median = pings[Math.floor(pings.length / 2)];
        resPing.textContent = Math.round(median);
        cardPing.classList.remove('active');
        return median;
    };

    const runDownloadTest = async () => {
        cardDownload.classList.add('active');
        speedUnit.textContent = 'Mbps';
        setGauge(0, GAUGE_MAX_MBPS);
        setNote('ダウンロード速度を測定しています…');

        const TIME_BUDGET_MS = 8000;
        const sizes = [1e6, 5e6, 10e6, 25e6, 50e6];
        let totalBytes = 0;
        let totalMs = 0;
        let lastMbps = 0;
        const overallStart = performance.now();

        for (const size of sizes) {
            if (performance.now() - overallStart > TIME_BUDGET_MS) break;
            const start = performance.now();
            const res = await fetch(DOWN_URL(size), { cache: 'no-store' });
            const reader = res.body.getReader();
            let received = 0;
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                received += value.length;
                const elapsed = (performance.now() - start) / 1000;
                if (elapsed > 0.15) {
                    const mbps = (received * 8) / elapsed / 1e6;
                    setGauge(mbps, GAUGE_MAX_MBPS);
                    resDownload.textContent = mbps.toFixed(1);
                }
            }
            const elapsedMs = performance.now() - start;
            // 小さすぎる転送は誤差が大きいので重みを下げる
            if (size >= 5e6 || totalBytes === 0) {
                totalBytes += received;
                totalMs += elapsedMs;
            }
            lastMbps = (received * 8) / (elapsedMs / 1000) / 1e6;
        }

        const avgMbps = totalMs > 0 ? (totalBytes * 8) / (totalMs / 1000) / 1e6 : lastMbps;
        resDownload.textContent = avgMbps.toFixed(1);
        setGauge(avgMbps, GAUGE_MAX_MBPS);
        cardDownload.classList.remove('active');
        return avgMbps;
    };

    const runUploadTest = async () => {
        cardUpload.classList.add('active');
        speedUnit.textContent = 'Mbps';
        setGauge(0, GAUGE_MAX_MBPS);
        setNote('アップロード速度を測定しています…');

        const TIME_BUDGET_MS = 8000;
        const sizes = [5e5, 1e6, 4e6, 8e6];
        let totalBytes = 0;
        let totalMs = 0;
        const overallStart = performance.now();

        for (const size of sizes) {
            if (performance.now() - overallStart > TIME_BUDGET_MS) break;
            const payload = new Uint8Array(size);
            crypto.getRandomValues(payload.subarray(0, Math.min(size, 65536)));
            const start = performance.now();
            await fetch(UP_URL, { method: 'POST', body: payload, cache: 'no-store' });
            const elapsedMs = performance.now() - start;
            if (size >= 1e6 || totalBytes === 0) {
                totalBytes += size;
                totalMs += elapsedMs;
            }
            const mbps = (size * 8) / (elapsedMs / 1000) / 1e6;
            setGauge(mbps, GAUGE_MAX_MBPS);
            resUpload.textContent = mbps.toFixed(1);
        }

        const avgMbps = totalMs > 0 ? (totalBytes * 8) / (totalMs / 1000) / 1e6 : 0;
        resUpload.textContent = avgMbps.toFixed(1);
        setGauge(avgMbps, GAUGE_MAX_MBPS);
        cardUpload.classList.remove('active');
        return avgMbps;
    };

    const runFullTest = async () => {
        if (testing) return;
        testing = true;
        startBtn.disabled = true;
        startBtn.textContent = '測定中…';
        resetUI();
        try {
            await runPingTest();
            await runDownloadTest();
            await runUploadTest();
            setNote('測定が完了しました。時間帯や接続方法を変えて数回測ると、より正確に判断できます。');
        } catch (e) {
            setNote('測定サーバーに接続できませんでした。ネットワーク、VPN、広告ブロッカー、ファイアウォールの設定を確認してから再試行してください。');
            resPing.textContent = resPing.textContent === '-' ? '測定不可' : resPing.textContent;
            resDownload.textContent = resDownload.textContent === '-' ? '測定不可' : resDownload.textContent;
            resUpload.textContent = resUpload.textContent === '-' ? '測定不可' : resUpload.textContent;
            [cardPing, cardDownload, cardUpload].forEach(c => c.classList.remove('active'));
        } finally {
            testing = false;
            startBtn.disabled = false;
            startBtn.textContent = 'もう一度測定する';
        }
    };

    startBtn.addEventListener('click', runFullTest);
});
