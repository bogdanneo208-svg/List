const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
    return { currentList: [], historyLists: [] };
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

app.get('/api/data', (req, res) => {
    res.json(loadData());
});

app.post('/api/save-all', (req, res) => {
    const { currentList, historyLists } = req.body;
    const data = {
        currentList: currentList || [],
        historyLists: historyLists || []
    };
    
    if (saveData(data)) {
        res.json({ success: true, data });
    } else {
        res.status(500).json({ success: false, message: 'Ошибка' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});