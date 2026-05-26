const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shopping_data')
      .select('data')
      .eq('id', 1)
      .single();

    if (error) throw error;

    res.json(data?.data || { currentList: [], historyLists: [] });
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    res.json({ currentList: [], historyLists: [] });
  }
});

app.post('/api/save-all', async (req, res) => {
  try {
    const { currentList, historyLists } = req.body;

    const { error } = await supabase
      .from('shopping_data')
      .update({
        data: { currentList, historyLists },
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) throw error;

    console.log('✅ Сохранено:', currentList?.length, 'товаров');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Ошибка сохранения:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер: http://localhost:${PORT}`);
});
