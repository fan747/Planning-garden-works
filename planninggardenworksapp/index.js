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

moongoose.connect('mongodb://localhost/planning-garden-works-app', {
  }).then(() => {
    console.log('Успешное подключение к MongoDB');
  }).catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
  });

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

const adviceSchema = new moongoose.Schema({
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    data: {
      type: String,
      required: true
    },
    list_of_work_link: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
        },
        message: props => `${props.value} не является допустимым URL!`
      }
    }
});

const GardenWorkTask = moongoose.model('garden-work-tasks', gardenWorkTaskSchema);
const GardenWorkCalendar = moongoose.model('garden-work-calendars', adviceSchema);

app.get('/garden-tasks/', async (req, res) => {
    let id = req.query.user_id

    if (!id)
    {
        return res.status(400).json({ error: `Необходимо заполнить id ${id}` });
    }

    try {
        let data = await GardenWorkTask.find({ user_id: id }).sort({ date: 1 });
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
        let task = new GardenWorkTask({ user_id, name, description, task_type, date });
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
        let task = await GardenWorkTask.findByIdAndUpdate(
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

app.delete('/delete-tasks/', async (req, res) => {
    let id = req.query.id; 

    if (!id) {
        console.log('Ошибка при получении id:', id);
        return res.status(400).json({ error: 'Необходимо заполнить id' });
    }

    try {
        let task = await GardenWorkTask.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }

        res.json({ message: 'Задача успешно удалена', task });
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        res.status(500).json({ error: 'Ошибка при удалении задачи' });
    }
});


app.get('/garden-advices/', async function (req, res) { 
    try {
        let data = await GardenWorkCalendar.find();
        res.json(data);  
    } catch (error) {
        console.error('Ошибка при получении совета:', error);
        res.status(500).json({ error: 'Ошибка при получении совета' });
    }
});


