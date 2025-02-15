const Order = require('../models/orderSchema.js');

const newOrder = async (req, res) => {
    try {

        const {
            buyer,
            shippingData,
            orderedProducts,
            paymentInfo,
            productsQuantity,
            totalPrice,
        } = req.body;

        const order = await Order.create({
            buyer,
            shippingData,
            orderedProducts,
            paymentInfo,
            paidAt: Date.now(),
            productsQuantity,
            totalPrice,
        });

        return res.send(order);

    } catch (err) {
        res.status(500).json(err);
    }
}

const getOrderedProductsByCustomer = async (req, res) => {
    try {
        let orders = await Order.find({ buyer: req.params.id });

        if (orders.length > 0) {
            const orderedProducts = orders.reduce((accumulator, order) => {
                accumulator.push(...order.orderedProducts);
                return accumulator;
            }, []);
            res.send(orderedProducts);
        } else {
            res.send({ message: "No products found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getOrderedProductsBySeller = async (req, res) => {
    try {
        const sellerId = req.params.id;

        // Fetch orders where the seller has products
        const ordersWithSellerId = await Order.find({ "orderedProducts.seller": sellerId })
            .populate("buyer", "name email phoneNo") // ✅ Fetch buyer details
            .select("orderedProducts buyer"); // ✅ Ensure buyer is selected

        console.log("🛒 Orders with Seller ID:", ordersWithSellerId);

        if (ordersWithSellerId.length > 0) {
            const orderedProducts = [];

            ordersWithSellerId.forEach(order => {
                order.orderedProducts.forEach(product => {
                    if (product.seller.toString() === sellerId) {
                        // ✅ Push a new product entry for each buyer
                        orderedProducts.push({
                            ...product.toObject(),
                            buyer: order.buyer, // ✅ Keep buyer unique for each purchase
                        });
                    }
                });
            });

            console.log("✅ Final Ordered Products Response:", orderedProducts);
            res.send(orderedProducts);
        } else {
            res.send({ message: "No products found" });
        }
    } catch (err) {
        console.error("❌ Error Fetching Orders:", err);
        res.status(500).json(err);
    }
};




module.exports = {
    newOrder,
    getOrderedProductsByCustomer,
    getOrderedProductsBySeller
};
