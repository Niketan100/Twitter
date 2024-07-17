import Notification from '../models/notification.js'
export const getNotifications =  async (req, res) => {

    try {
        const userId  = req.user._id;

        const notifications = await Notification.find({to : userId})
        .populate({
            path: 'from',
            select: "username profilePic"
        });

        await Notification.updateMany({to : userId}, {read: true});
        res.status(200).send({notifications});

    } catch (error) {
        console.error(error);
        res.status(404).json({error: error});
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to : userId});

        res.status(200).json({message :"deleted successfully"})

    } catch (error) {
        console.error(error);
        res.status(404).json({error: error});
    }

}