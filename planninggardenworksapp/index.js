const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const User = require('./src/models/User');
const crypto = require('crypto');

require('dotenv').config();
const secretKey = process.env.JWT_SECRET; 

if (!secretKey) {
    console.error('Ошибка: JWT_SECRET не задан в .env файле');
    process.exit(1); 
}


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
        type: moongoose.Schema.Types.ObjectId,
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

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден, доступ запрещен' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded; 
      next(); 
    } catch (error) {
      return res.status(403).json({ error: 'Токен недействителен или истек' });
    }
  };

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким username уже существует' });
        }

        existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        if (password.lenght < 6 ) {
            return res.status(400).json({ error: 'Пароль должен иметь минимум 6 символов' });
        }
        const user = new User({ username, email, password });
        await user.save();
        const token = jwt.sign({ userID: user._id }, secretKey, { expiresIn: '1h' });

        res.json({ message: 'Пользователь успешно зарегистрирован', token });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка регистрации', details: error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const token = jwt.sign({ userID: user._id }, secretKey, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка входа', details: error });
    }
});

app.get('/garden-tasks/', authenticateToken, async (req, res) => {
    let id = req.user.userID;

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

app.post('/garden-tasks/', authenticateToken, async (req, res) => {
    let user_id = req.user.userID; 
    let { name, description, task_type, date } = req.body;

    if (!user_id || !name || !description || !task_type || !date) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    try {
        user_id = new moongoose.Types.ObjectId(user_id);
    } catch (err) {
        return res.status(400).json({ error: 'Некорректный формат user_id' });
    }

    try {
        const task = new GardenWorkTask({ user_id, name, description, task_type, date });
        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Ошибка при сохранении задачи:', error);
        res.status(500).json({ error: 'Ошибка при сохранении задачи' });
    }
});

app.put('/garden-tasks/', authenticateToken, async (req, res) => {
    let taskId = req.query.id;
    let isFinished = req.body.is_finished; 

    try {
        let updatedTask = await GardenWorkTask.findByIdAndUpdate(
            taskId, 
            { $set: { is_finished: isFinished } }, 
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Задача не найдена при обновлении' });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        res.status(500).json({ error: 'Ошибка при обновлении задачи' });
    }
});


app.delete('/delete-tasks/',authenticateToken, async (req, res) => {
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


