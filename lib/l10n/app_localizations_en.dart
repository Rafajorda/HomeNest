// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'HomeNest';

  @override
  String get settings => 'Settings';

  @override
  String get darkMode => 'Dark Mode';

  @override
  String get darkModeSubtitle => 'Enable or disable dark mode';

  @override
  String get language => 'Language';

  @override
  String get spanish => 'Spanish';

  @override
  String get english => 'English';

  @override
  String get login => 'Login';

  @override
  String get register => 'Register';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get name => 'Name';

  @override
  String get noAccount => 'Don\'t have an account? Sign up';

  @override
  String get cancel => 'Cancel';

  @override
  String get completeAllFields => 'Please complete all fields';

  @override
  String get incorrectCredentials => 'Incorrect credentials';

  @override
  String get registrationError => 'Error registering user. Check the data.';

  @override
  String get invalidCredentials => 'Invalid credentials';

  @override
  String get emailAlreadyRegistered => 'Email is already registered';

  @override
  String get usernameAlreadyInUse => 'Username is already in use';

  @override
  String get sessionExpired => 'Session expired. Please login again';

  @override
  String get connectionError => 'Connection error. Check your internet connection';

  @override
  String get serverError => 'Server error. Please try again later';

  @override
  String get invalidEmail => 'Invalid email format';

  @override
  String get passwordTooShort => 'Password must be at least 6 characters';

  @override
  String get loginSuccessful => 'Login successful';

  @override
  String get registerSuccessful => 'Registration successful';

  @override
  String get logoutSuccessful => 'Logout successful';

  @override
  String get logout => 'Logout';

  @override
  String get logoutConfirmTitle => 'Logout';

  @override
  String logoutConfirmMessage(String userName) {
    return 'Are you sure you want to logout, $userName?';
  }

  @override
  String hello(String userName) {
    return 'Hello, $userName!';
  }

  @override
  String get user => 'User';

  @override
  String get profile => 'Profile';

  @override
  String get editProfile => 'Edit Profile';

  @override
  String get myOrders => 'My Orders';

  @override
  String get favorites => 'Favorites';

  @override
  String get addresses => 'Addresses';

  @override
  String get comingSoon => 'Coming soon';

  @override
  String get notLoggedIn => 'Not logged in';

  @override
  String get loginToSeeProfile => 'Login to see your profile and orders';

  @override
  String get colorLabel => 'Color';

  @override
  String get availableColors => 'Available colors:';

  @override
  String get dimensionsLabel => 'Dimensions';

  @override
  String get favoritesLabel => 'Favorites';

  @override
  String get addToCartButton => 'Add to cart';

  @override
  String get addedToCartMessage => 'Product added to cart 🛒';

  @override
  String get errorLoadingProducts => 'Error loading products';

  @override
  String get retry => 'Retry';

  @override
  String get loading => 'Loading...';

  @override
  String get noProductsFound => 'No products found';

  @override
  String get allCategories => 'All';

  @override
  String get productDetails => 'Product Details';

  @override
  String get specifications => 'Specifications';

  @override
  String get addedToFavorites => 'Added to favorites ❤️';

  @override
  String get removedFromFavorites => 'Removed from favorites';

  @override
  String get inFavorites => 'In favorites';

  @override
  String get addToFavorites => 'Add to favorites';

  @override
  String get mustLoginToAddFavorites => 'You must log in to add favorites';

  @override
  String get errorLoadingImage => 'Error loading image';

  @override
  String get color => 'Color';

  @override
  String get dimensions => 'Dimensions';

  @override
  String get model3D => '3D Model';

  @override
  String get onlyFavorites => 'Only Favorites';

  @override
  String get clearAllFilters => 'Clear all filters';

  @override
  String get profileTooltip => 'Profile';

  @override
  String get settingsTooltip => 'Settings';

  @override
  String get cartTooltip => 'Cart';

  @override
  String get searchTooltip => 'Search';

  @override
  String get homeTooltip => 'Home';

  @override
  String get catalogTooltip => 'Catalog';

  @override
  String get accountSettings => 'Account Settings';

  @override
  String get notifications => 'Notifications';

  @override
  String get privacy => 'Privacy';

  @override
  String get help => 'Help & Support';

  @override
  String get about => 'About';

  @override
  String get version => 'Version';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get deleteAccountConfirm => 'Are you sure you want to delete your account?';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String get cart => 'Cart';

  @override
  String get emptyCart => 'Your cart is empty';

  @override
  String get cartTotal => 'Total';

  @override
  String get checkout => 'Checkout';

  @override
  String get removeFromCart => 'Remove from cart';

  @override
  String get clearCart => 'Clear cart';

  @override
  String get clearCartConfirm => 'Are you sure you want to clear your cart?';

  @override
  String get quantity => 'Quantity';

  @override
  String get subtotal => 'Subtotal';

  @override
  String get total => 'Total';

  @override
  String get proceedToCheckout => 'Proceed to checkout';

  @override
  String get itemRemoved => 'Item removed from cart';

  @override
  String get cartCleared => 'Cart cleared';

  @override
  String get orders => 'Orders';

  @override
  String get orderHistory => 'Order History';

  @override
  String get orderNumber => 'Order #';

  @override
  String get orderDate => 'Date';

  @override
  String get orderStatus => 'Status';

  @override
  String get orderTotal => 'Total';

  @override
  String get orderDetails => 'Order Details';

  @override
  String get trackOrder => 'Track Order';

  @override
  String get cancelOrder => 'Cancel Order';

  @override
  String get reorder => 'Reorder';

  @override
  String get noOrders => 'You have no orders yet';

  @override
  String get orderPlaced => 'Order placed successfully';

  @override
  String get orderCancelled => 'Order cancelled';

  @override
  String get pending => 'Pending';

  @override
  String get processing => 'Processing';

  @override
  String get shipped => 'Shipped';

  @override
  String get delivered => 'Delivered';

  @override
  String get cancelled => 'Cancelled';

  @override
  String get search => 'Search';

  @override
  String get searchProducts => 'Search products...';

  @override
  String get searchResults => 'Search Results';

  @override
  String get noResults => 'No results found';

  @override
  String get filters => 'Filters';

  @override
  String get sortBy => 'Sort by';

  @override
  String get priceRange => 'Price Range';

  @override
  String get category => 'Category';

  @override
  String get applyFilters => 'Apply Filters';

  @override
  String get clearFilters => 'Clear Filters';

  @override
  String resultsFound(int count) {
    return '$count results found';
  }

  @override
  String get sortByNewest => 'Newest';

  @override
  String get sortByPriceAsc => 'Price: Low to High';

  @override
  String get sortByPriceDesc => 'Price: High to Low';

  @override
  String get sortByPopularity => 'Popularity';

  @override
  String get required => 'This field is required';

  @override
  String get invalidEmailFormat => 'Invalid email format';

  @override
  String get passwordMismatch => 'Passwords do not match';

  @override
  String minLength(int count) {
    return 'Minimum $count characters required';
  }

  @override
  String maxLength(int count) {
    return 'Maximum $count characters allowed';
  }

  @override
  String get invalidPhoneNumber => 'Invalid phone number';

  @override
  String get invalidPostalCode => 'Invalid postal code';

  @override
  String get close => 'Close';

  @override
  String get save => 'Save';

  @override
  String get edit => 'Edit';

  @override
  String get delete => 'Delete';

  @override
  String get confirm => 'Confirm';

  @override
  String get back => 'Back';

  @override
  String get next => 'Next';

  @override
  String get previous => 'Previous';

  @override
  String get done => 'Done';

  @override
  String get apply => 'Apply';

  @override
  String get clear => 'Clear';

  @override
  String get refresh => 'Refresh';

  @override
  String get share => 'Share';

  @override
  String get more => 'More';

  @override
  String get less => 'Less';

  @override
  String get viewAll => 'View All';

  @override
  String get viewLess => 'View Less';

  @override
  String get noColorsAvailable => 'No colors available';

  @override
  String get seeMore => 'See more';

  @override
  String get seeLess => 'See less';

  @override
  String get moreColors => 'more';

  @override
  String get priceRangeLabel => 'Price Range';

  @override
  String get minimum => 'Minimum';

  @override
  String get maximum => 'Maximum';

  @override
  String get characteristicsLabel => 'Characteristics';

  @override
  String get hasModel3D => 'Has 3D model';

  @override
  String get viewARProducts => 'View products with AR visualization';

  @override
  String get onlyMyFavorites => 'Only my favorites';

  @override
  String get showOnlyFavoriteProducts => 'Show only favorite products';

  @override
  String get sortByLabel => 'Sort by';

  @override
  String get selectOrder => 'Select order';

  @override
  String get noSort => 'No sort';

  @override
  String get sortByName => 'Name';

  @override
  String get sortByPrice => 'Price';

  @override
  String get sortByNewestFirst => 'Most recent';

  @override
  String get ascending => 'Ascending';

  @override
  String get descending => 'Descending';

  @override
  String get clearAllButton => 'Clear';

  @override
  String get applyFiltersButton => 'Apply Filters';

  @override
  String errorLoadingColors(String error) {
    return 'Error loading colors: $error';
  }

  @override
  String get noProductsAvailable => 'No products available 🛍️';

  @override
  String get errorLoading => 'Error loading';

  @override
  String get clearFiltersTooltip => 'Clear filters';

  @override
  String get unexpectedError => 'Unexpected error';

  @override
  String get invalidCredentialsError => 'Invalid credentials';

  @override
  String get emailOrPasswordIncorrect => 'Email or password incorrect';

  @override
  String get loginError => 'Login error';

  @override
  String get connectionToServerError => 'Connection error to server. Check that backend is running.';

  @override
  String get emailOrUsernameAlreadyInUse => 'Email or username is already in use';

  @override
  String get validationError => 'Validation error';

  @override
  String get registrationErrorMessage => 'Error registering';

  @override
  String get sessionExpiredRefresh => 'Session expired. Please log in again.';

  @override
  String get errorRefreshingSession => 'Error refreshing session';

  @override
  String get connectionErrorRefreshing => 'Connection error while refreshing session';

  @override
  String get unexpectedResponseFormat => 'Unexpected response format';

  @override
  String get errorGettingProducts => 'Error getting products';

  @override
  String get connectionErrorProducts => 'Connection error';

  @override
  String get productNotFound => 'Product not found';

  @override
  String get errorGettingProduct => 'Error getting product';

  @override
  String get errorGettingProductsByCategory => 'Error getting products by category';

  @override
  String get errorSearchingProducts => 'Error searching products';

  @override
  String get errorGettingCart => 'Error getting cart';

  @override
  String get errorAddingToCart => 'Error adding to cart';

  @override
  String get itemNotFoundInCart => 'Item not found in cart';

  @override
  String get errorUpdatingCart => 'Error updating cart';

  @override
  String get errorRemovingFromCart => 'Error removing from cart';

  @override
  String get errorClearingCart => 'Error clearing cart';

  @override
  String get notAuthenticated => 'Not authenticated';

  @override
  String get errorGettingFavorites => 'Error getting favorites';

  @override
  String get unauthorized => 'Unauthorized';

  @override
  String get productAlreadyInFavorites => 'Product already in favorites';

  @override
  String get errorAddingToFavorites => 'Error adding to favorites';

  @override
  String get favoriteNotFound => 'Favorite not found';

  @override
  String get errorRemovingFromFavorites => 'Error removing from favorites';

  @override
  String get productNotFoundInFavorites => 'Product not found in favorites';

  @override
  String get errorGettingCategories => 'Error getting categories';

  @override
  String get errorGettingCategoriesConnection => 'Connection error';

  @override
  String bearerToken(String token) {
    return 'Bearer $token';
  }

  @override
  String get requestTypeNotSupported => 'Request type not supported';

  @override
  String get viewWidgetCatalog => 'View general widgets catalog';

  @override
  String errorDisplay(String error) {
    return 'Error: $error';
  }

  @override
  String get areYouSureLogout => 'Are you sure you want to logout?';

  @override
  String get loginToSeeProfileAndOrders => 'Login to see your profile and orders';
}
