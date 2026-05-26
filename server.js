const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Загрузка данных из переменной окружения
function loadData() {
    try {
        const savedData = process.env.SAVED_DATA;
        if (savedData && savedData !== 'empty') {
            console.log('Загружаю сохранённые данные...');
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error.message);
    }
    return { currentList: [], historyLists: [] };
}

// Сохранение данных (просто логируем в консоль)
function saveDataToLog(data) {
    console.log('='.repeat(50));
    console.log('📋 ДАННЫЕ ДЛЯ СОХРАНЕНИЯ (скопируй это в Environment Variables):');
    console.log('Ключ: SAVED_DATA');
    console.log('Значение:', JSON.stringify(data));
    console.log('='.repeat(50));
}

// Инициализация
let DATA = loadData();
console.log(`Загружено: ${DATA.currentList.length} товаров, ${DATA.historyLists.length} записей в истории`);

app.get('/api/data', (req, res) => {
    res.json(DATA);
});

app.post('/api/save-all', (req, res) => {
    const { currentList, historyLists } = req.body;
    
    DATA = {
        currentList: currentList || [],
        historyLists: historyLists || []
    };
    
    // Выводим в консоль для копирования
    saveDataToLog(DATA);
    
    res.json({ success: true, data: DATA });
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    console.log(`📦 Товаров в списке: ${DATA.currentList.length}`);
});
