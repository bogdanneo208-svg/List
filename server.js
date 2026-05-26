const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: SUPABASE_URL и SUPABASE_KEY должны быть указаны в переменных окружения Render');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Получение текущего списка
app.get('/api/data', async (req, res) => {
  try {
    // Получаем текущий список
    const { data: currentList, error: currentError } = await supabase
      .from('current_list')
      .select('*')
      .order('created_at', { ascending: true });

    if (currentError) throw currentError;

    // Получаем историю
    const { data: historyLists, error: historyError } = await supabase
      .from('history_lists')
      .select('*')
      .order('date', { ascending: false });

    if (historyError) throw historyError;

    res.json({
      currentList: currentList || [],
      historyLists: historyLists || []
    });
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    res.status(500).json({ error: error.message });
  }
});

// Сохранение всех данных
app.post('/api/save-all', async (req, res) => {
  const { currentList, historyLists } = req.body;

  try {
    // Очищаем текущий список и вставляем новый
    await supabase.from('current_list').delete().neq('id', 0);

    if (currentList && currentList.length > 0) {
      const items = currentList.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'шт'
      }));

      const { error: insertError } = await supabase
        .from('current_list')
        .insert(items);

      if (insertError) throw insertError;
    }

    // Очищаем историю и вставляем новую
    await supabase.from('history_lists').delete().neq('id', 0);

    if (historyLists && historyLists.length > 0) {
      const history = historyLists.map(item => ({
        id: item.id,
        date: item.date,
        items: item.items
      }));

      const { error: historyError } = await supabase
        .from('history_lists')
        .insert(history);

      if (historyError) throw historyError;
    }

    console.log('✅ Данные сохранены в Supabase');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  console.log(`📦 Supabase: ${supabaseUrl}`);
});
