const router = require('express').Router();
const { Category, Recipe, Comment, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/login', async (req, res) => {
  // If the user is already logged in, redirect the request to another route
  try {
    const categoryData = await Category.findAll();
    const categories = categoryData.map((category) =>
      category.get({ plain: true })
    );
    if (req.session.logged_in) {
      res.redirect('/api/user-profile');
      return;
    }
    res.render('login', { categories, login: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// route to get all categories and recipies
router.get('/', async (req, res) => {
  try {
    const loggedIn = req.session.logged_in;
    const categoryData = await Category.findAll();
    const recipeData = await Recipe.findAll();
    const categories = categoryData.map((category) =>
      category.get({ plain: true })
    );
    const recipes = recipeData.map((recipie) => recipie.get({ plain: true }));
    res.render('all', { recipes, categories, logged_in: loggedIn });
  } catch (error) {
    res.status(500).json(err);
  }
});

// get Recipe by Category id
router.get('/:id', async (req, res) => {
  try {
    const loggedIn = req.session.logged_in;
    const categoryData = await Category.findAll();
    const categories = categoryData.map((category) =>
      category.get({ plain: true })
    );
    const recipePktData = await Category.findByPk(req.params.id, {
      include: [{ model: Recipe }],
    });
    const recipePK = recipePktData.get({ plain: true });
    res.render('all', { recipePK, categories, logged_in: loggedIn });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get recipe by id
router.get('/recipes/:id', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
    });
    console.log(userData);
    console.log(userData.dataValues.id);

    const categoryData = await Category.findAll();
    const categories = categoryData.map((category) =>
      category.get({ plain: true })
    );
    const recipeData = await Recipe.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          include: {
            model: User,
          },
        },
      ],
    });
    const recipe = recipeData.get({ plain: true });
    res.render('recipes', {
      userData,
      recipe,
      categories,
      logged_in: req.session.logged_in,
      login: true,
    });
    // res.json(recipeData)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
