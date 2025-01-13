const mongoose = require('mongoose');

const gardenWorkTaskSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    task_type: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    is_finished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, 
});

const GardenWorkTask = mongoose.model('GardenWorkTask', gardenWorkTaskSchema);

module.exports = GardenWorkTask;
