const stackModels = require('../models/stackModels');
const { stackSchema } = require('../validation/JoiSchemas');

const addStack = async (req, res) => {
    const { name, description, iconComponent } = req.body;
    try {
        await stackSchema.validateAsync({ name, description, iconComponent });
        const newStack = new stackModels({
            name,
            description,
            iconComponent
        });
        await newStack.save();
        res.status(201).json({ success: true, message: "Stack added successfully" });
    } catch (error) {
        if (error.isJoi) return res.status(400).json({ success: false, message: error.details[0].message });
        res.status(500).json({ success: false, message: "An error occurred while adding stack: " + error.message });
    }
};

const listStacks = async (req, res) => {
    try {
        const stacks = await stackModels.find();
        res.status(200).json({ success: true, count: stacks.length, data: stacks });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while listing stacks: " + error.message });
    }
};



const updateStack = async (req, res) => {
    const { id } = req.params;
    const { name, description, iconComponent } = req.body;

    try {
        const stack = await stackModels.findById(id);

        if (!stack) return res.status(404).json({ success: false, message: "Stack with the specified id was not found" });

        const updatedStack = await stackModels.findByIdAndUpdate(id, {
            name,
            description,
            iconComponent
        }, { new: true });

        res.status(200).json({ success: true, message: "Stack updated successfully", data: updatedStack });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while updating stack: " + error.message });
    }
};

const deleteStack = async (req, res) => {
    const { id } = req.params;

    try {
        const stack = await stackModels.findById(id);
        if (!stack) return res.status(404).json({ success: false, message: "Stack with specified id was not found" });

        await stackModels.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Stack deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while deleting stack: " + error.message });
    }
};

module.exports = { addStack, listStacks, updateStack, deleteStack };