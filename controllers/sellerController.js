const bcrypt = require('bcrypt');
const Seller = require('../models/sellerSchema.js');
const { createNewToken } = require('../utils/token.js');

const sellerRegister = async (req, res) => {
    try {
        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        // Check if email or shop name already exists
        const existingSellerByEmail = await Seller.findOne({ email: req.body.email });
        const existingShop = await Seller.findOne({ shopName: req.body.shopName });

        if (existingSellerByEmail) {
            return res.send({ message: 'Email already exists' });
        }
        if (existingShop) {
            return res.send({ message: 'Shop name already exists' });
        }

        // Create new seller
        const seller = new Seller({
            ...req.body,
            password: hashedPass
        });

        // Save seller to DB
        let result = await seller.save();
        result.password = undefined;

        // Generate token
        const token = createNewToken(result._id);

        // Ensure correct data structure
        result = {
            ...result.toObject(),
            token: token
        };

        console.log("Result is: ", result);
        res.send(result);
    } catch (err) {
        console.log("Error:", err); // Debugging
        res.status(500).json({ error: "Internal Server Error", details: err });
    }
};


const sellerLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let seller = await Seller.findOne({ email: req.body.email });
        if (seller) {
            const validated = await bcrypt.compare(req.body.password, seller.password);
            if (validated) {
                seller.password = undefined;

                const token = createNewToken(seller._id)

                seller = {
                    ...seller._doc,
                    token: token
                };

                res.send(seller);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

module.exports = { sellerRegister, sellerLogIn };
