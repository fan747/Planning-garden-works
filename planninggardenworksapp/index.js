const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server is running on port ${port}`);
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const moongoose = require('mongoose');

moongoose.connect('mongodb://localhost/planning-garden-works-app')

const gardenWorkTaskSchema = new moongoose.Schema({
    user_id:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    
    description: {
        type: String,
    },

    task_type: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    is_finished: {
        type: Boolean,
        default: false,
    },
},{
    timestamps: true,
});

const Product = moongoose.model('garden-work-tasks', gardenWorkTaskSchema);

app.get('/garden-tasks/', async (req, res) => {
    let id = req.query.user_id

    if (!id)
    {
        return res.status(400).json({ error: `Необходимо заполнить id ${id}` });
    }

    try {
        let data = await Product.find({ user_id: id }).sort({ date: 1 });
        res.json(data);  
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        res.status(500).json({ error: 'Ошибка при получении задач' });
    }
});

app.post('/garden-tasks/', async (req, res) => {
    let user_id = req.body.user_id;
    let name = req.body.name;
    let description = req.body.description;
    let task_type = req.body.task_type;
    let date = req.body.date;

    if (!user_id || !name || !description || !task_type)
    {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    try {
        let task = new Product({ user_id, name, description, task_type, date });
        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Ошибка при сохранении задачи:', error);
        res.status(500).json({ error: 'Ошибка при сохранении задачи' });
    }
});

app.put('/garden-tasks/', async (req, res) => {
    let id = req.query.id; 
    let isFinished = req.body.is_finished; 

    if (!id) {
        console.log('Ошибка при получении id:', id);
        return res.status(400).json({ error: 'Необходимо заполнить id' });
    }

    try {
        let task = await Product.findByIdAndUpdate(
            { _id: id },
            { $set: { is_finished: isFinished } }, 
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        res.json(task);
    } catch (error) {
        console.error('Ошибка при сохранении задачи:', error);
        res.status(500).json({ error: 'Ошибка при сохранении задачи' });
    }
});
