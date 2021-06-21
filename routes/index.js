const express = require('express');
const router = express.Router();

const Customer = require('../models/Customer');

const {
  authMiddleware,
  mongooseValidateRequest,
  mongooseValidateObjectID
} = require('../helpers');

/**
 * Base Routes
 */
router
  .route('/')
  /**
   * Create New Customer
   *
   * @access 3
   *
   * @param {string} name - Customer name / company name
   * @param {array.<String>} email - Array of Customer emails
   * @param {Array.<{street: string, city: string, state: string, zip: string, unit: string, comment: string}>} addresses - Array of Customer Addresses
   * @param {Array.<{number: string, comment: string}>} phone - Array of Customer Phone Numbers
   * @param {Array.<{staff: string, comment: string}>} notes - Array of Customer Phone Numbers
   *
   * @return {object} - Customer Object.
   */
  .post(authMiddleware(3), (req, res) => {
    const NewCustomer = new Customer(req.body);
    NewCustomer.save()
      .then((customer) => {
        res.json(customer);
      })
      .catch((error) => {
        let errArray = [];
        if (error.name == 'ValidationError') {
          for (field in error.errors) {
            errArray.push({
              message: `Customer Field: "${error.errors[field].path}" is required.`
            });
          }
        }
        if (errArray.length < 1) {
          errArray.push({
            message: `Something Went Wrong`
          });
        }
        res.status(400).send({
          errors: errArray
        });
      });
  })
  .get(authMiddleware(3), async (req, res) => {
    let customers = await Customer.find();
    res.send(customers);
  });

router
  .route('/order')
  /**
   * Add Order to Customer
   *
   * @param {string} customer - Customer id
   * @param {string} order - Order id
   *
   * @return {object} - Customer Object.
   */
  .post(authMiddleware(3), async (req, res) => {
    let { customer, order } = req.body;

    // Validate ObjectID
    if (!mongooseValidateObjectID(customer)) {
      return res.status(400).json({ errors: [{ message: 'Bad Request' }] });
    }
    if (!mongooseValidateObjectID(order)) {
      return res.status(400).json({ errors: [{ message: 'Bad Request' }] });
    }

    let dbCustomer = await Customer.findById(customer);

    if (!dbCustomer) {
      return res
        .status(404)
        .json({ errors: [{ message: 'No Customer Found' }] });
    }

    // Find Order in Orders by Order ID
    let inOrders = dbCustomer.orders.indexOf(order);
    if (inOrders >= 0) {
      return res
        .status(400)
        .json({ errors: [{ message: 'Order Already Attached To Customer' }] });
    }

    dbCustomer.orders.push(order);
    dbCustomer
      .save()
      .then(() => {
        return res.json(dbCustomer);
      })
      .catch((err) => {
        // TODO POST Request to Error service with request and err.
        return res
          .status(500)
          .json({ errors: [{ message: 'Database Error' }] });
      });
  })
  /**
   * Delete Order From Customer
   *
   * @param {string} customer - Customer id
   * @param {string} order - Order id
   *
   * @return {object} - Customer Object.
   */
  .delete(authMiddleware(3), async (req, res) => {
    let { customer, order } = req.body;

    // Validate ObjectID
    if (!mongooseValidateObjectID(customer)) {
      return res.status(400).json({ errors: [{ message: 'Bad Request' }] });
    }
    if (!mongooseValidateObjectID(order)) {
      return res.status(400).json({ errors: [{ message: 'Bad Request' }] });
    }

    let dbCustomer = await Customer.findById(customer);

    if (!dbCustomer) {
      return res
        .status(404)
        .json({ errors: [{ message: 'No Customer Found' }] });
    }

    // Find Order in Orders by Order ID
    let inOrders = dbCustomer.orders.indexOf(order);
    if (inOrders < 0) {
      return res.status(404).json({ errors: [{ message: 'No Order Found' }] });
    }

    let filteredOrders = dbCustomer.orders.filter((id) => {
      return id != order;
    });

    dbCustomer.orders = filteredOrders;

    dbCustomer
      .save()
      .then(() => {
        return res.json(dbCustomer);
      })
      .catch((err) => {
        // TODO POST Request to Error service with request and err.
        return res
          .status(500)
          .json({ errors: [{ message: 'Database Error' }] });
      });
  });

router
  .route('/search/:Query')
  /**
   * Search Customers by Query
   *
   * @return {array} - Array of Customer Objects.
   */
  .get(authMiddleware(3), async (req, res) => {
    try {
      let customers = await Customer.find({
        name: { $regex: new RegExp(req.params.Query, 'i') }
      }).limit(100);

      res.json(customers);
    } catch (err) {
      // TODO POST Request to Error service with request and err.
      return res
        .status(400)
        .json({ errors: [{ message: 'Bad Search Query' }] });
    }
  });

router
  .route('/single/:id')
  /**
   * Get Customer
   *
   * @return {object} - Customer Object.
   */
  .get(authMiddleware(3), mongooseValidateRequest, async (req, res) => {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res
        .status(404)
        .json({ errors: [{ message: 'No Customer Found' }] });
    }

    return res.json(customer);
  })
  /**
   * Update Customer
   *
   * @return {object} - Customer Object.
   */
  .put(authMiddleware(3), mongooseValidateRequest, async (req, res) => {
    await Customer.updateOne({ _id: req.params.id }, req.body);
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ errors: [{ message: 'No Customer Found' }] });
    }

    return res.json({ success: true });
  })
  /**
   * Delete Customer
   *
   * @return {boolean} - Success or Error.
   */
  .delete(authMiddleware(3), mongooseValidateRequest, async (req, res) => {
    let customer = await Customer.findById(req.params.id);

    if (customer) {
      customer.remove();
      res.json({ success: true });
    } else {
      return res
        .status(404)
        .json({ errors: [{ message: 'No Customer Found' }] });
    }
  });

module.exports = router;
