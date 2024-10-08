const collaboratorModels = require('../models/collaboratorModels');
const { collaboratorSchema } = require('../validation/JoiSchemas');

const addCollaborator = async (req, res) => {
    const { name, role, image, githubLink } = req.body;

    try {
        await collaboratorSchema.validateAsync({ name, role, image, githubLink });

        const checkCollaborator = await collaboratorModels.findOne({
            $or: [
                { name },
                { githubLink }
            ]
        })
        if (checkCollaborator) return res.status(400).json({ success: false, message: "Collaborator with the same name or github link already exists" })

        const newCollaborator = new collaboratorModels({
            name,
            role,
            image,
            githubLink
        });

        await newCollaborator.save();
        return res.status(201).json({ success: true, message: "New collaborator added successfully" });
    } catch (error) {
        if (error.isJoi) {
            // Joi validation error
            return res.status(422).json({ success: false, message: error.details[0].message });
        }
        res.status(500).json({ success: false, message: "An error occurred while adding collaborator: ", error: error.message });
    }
};

const deleteCollaborator = async (req, res) => {
    const { id } = req.params;

    try {
        const collaborator = await collaboratorModels.findById(id);

        if (!collaborator) return res.status(404).json({ success: false, message: "Collaborator with the specified id was not found" });

        await collaboratorModels.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Collaborator deleted successfully" });



    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while deleting collaborator: ", error: error.message });
    }
};

const updateCollaborator = async (req, res) => {
    const { id } = req.params;

    try {
        const existingCollaborator = await collaboratorModels.findById(id);
        if (!existingCollaborator) {
            return res.status(404).json({ success: false, message: "Collaborator with specified id does not exist" });
        }

        const { name } = req.body;
        const otherCollaboratorWithSameName = await collaboratorModels.findOne({ name, _id: { $ne: id } });
        if (otherCollaboratorWithSameName) {
            return res.status(400).json({ success: false, message: "Another collaborator with the same name already exists" });
        }

        const updatedCollaborator = await collaboratorModels.findByIdAndUpdate(id, {
            name: req.body.name,
            role: req.body.role,
            image: req.body.image,
            githubLink: req.body.githubLink
        }, { new: true });

        return res.status(200).json({ success: true, message: "Collaborator updated successfully", data: updatedCollaborator });

    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while updating collaborator", error: error.message });
    }
};



const listCollaborators = async (req, res) => {
    const { limit } = req.query

    try {
        const intLimit = parseInt(limit)
        let collaborators;
        if (!isNaN(intLimit)) {
            collaborators = await collaboratorModels.find().limit(intLimit);
        } else {
            collaborators = await collaboratorModels.find();
        }

        res.status(200).json({ success: true, count: collaborators.length, data: collaborators });
    } catch (error) {
        res.status(500).json({ success: false, message: "An error occurred while fetching collaborators: ", error: error.message });
    }
};

module.exports = { addCollaborator, deleteCollaborator, updateCollaborator, listCollaborators };
