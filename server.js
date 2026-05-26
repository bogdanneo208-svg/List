const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL и SUPABASE_KEY не найдены');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/data', async (req, res) => {
  try {
    console.log('📥 Запрос данных...');
    
    const { data: currentList, error: currentError } = await supabase
      .from('current_list')
      .select('*')
      .order('created_at', { ascending: true });

    if (currentError) {
      console.error('❌ Ошибка current_list:', currentError);
      throw currentError;
    }
    
    console.log('📋 Текущий список из БД:', currentList?.length || 0, 'товаров');

    const { data: historyLists, error: historyError } = await supabase
      .from('history_lists')
      .select('*')
      .order('date', { ascending: false });

    if (historyError) {
      console.error('❌ Ошибка history_lists:', historyError);
      throw historyError;
    }
    
    console.log('📦 История из БД:', historyLists?.length || 0, 'записей');

    res.json({
      currentList: currentList || [],
      historyLists: historyLists || []
    });
  } catch (error) {
    console.error('❌ Ошибка получения:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-all', async (req, res) => {
  const { currentList, historyLists } = req.body;

  console.log('💾 Сохранение:');
  console.log('  - Товаров:', currentList?.length || 0);
  console.log('  - Истории:', historyLists?.length || 0);

  try {
    // Сохраняем текущий список
    console.log('🔄 Очищаю current_list...');
    const { error: deleteError } = await supabase
      .from('current_list')
      .delete()
      .neq('id', '0');
    
    if (deleteError) {
      console.error('❌ Ошибка очистки current_list:', deleteError);
    }

    if (currentList && currentList.length > 0) {
      const items = currentList.map(item => ({
        id: String(item.id),
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'шт'
      }));

      console.log('📝 Вставляю товары:', items);
      
      const { error: insertError } = await supabase
        .from('current_list')
        .insert(items);

      if (insertError) {
        console.error('❌ Ошибка вставки current_list:', insertError);
        throw insertError;
      }
      
      console.log('✅ Товары сохранены');
    } else {
      console.log('📭 Текущий список пуст');
    }

    // Сохраняем историю
    console.log('🔄 Очищаю history_lists...');
    const { error: historyDeleteError } = await supabase
      .from('history_lists')
      .delete()
      .neq('id', '0');
    
    if (historyDeleteError) {
      console.error('❌ Ошибка очистки history_lists:', historyDeleteError);
    }

    if (historyLists && historyLists.length > 0) {
      const history = historyLists.map(item => ({
        id: String(item.id),
        date: item.date,
        items: item.items
      }));

      console.log('📝 Вставляю историю...');
      
      const { error: historyError } = await supabase
        .from('history_lists')
        .insert(history);

      if (historyError) {
        console.error('❌ Ошибка вставки history_lists:', historyError);
        throw historyError;
      }
      
      console.log('✅ История сохранена');
    }

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
