import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_es.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('es')
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'HomeNest'**
  String get appTitle;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @darkMode.
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get darkMode;

  /// No description provided for @darkModeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enable or disable dark mode'**
  String get darkModeSubtitle;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @spanish.
  ///
  /// In en, this message translates to:
  /// **'Spanish'**
  String get spanish;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @name.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get name;

  /// No description provided for @noAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? Sign up'**
  String get noAccount;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @completeAllFields.
  ///
  /// In en, this message translates to:
  /// **'Please complete all fields'**
  String get completeAllFields;

  /// No description provided for @incorrectCredentials.
  ///
  /// In en, this message translates to:
  /// **'Incorrect credentials'**
  String get incorrectCredentials;

  /// No description provided for @registrationError.
  ///
  /// In en, this message translates to:
  /// **'Error registering user. Check the data.'**
  String get registrationError;

  /// No description provided for @invalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Invalid credentials'**
  String get invalidCredentials;

  /// No description provided for @emailAlreadyRegistered.
  ///
  /// In en, this message translates to:
  /// **'Email is already registered'**
  String get emailAlreadyRegistered;

  /// No description provided for @usernameAlreadyInUse.
  ///
  /// In en, this message translates to:
  /// **'Username is already in use'**
  String get usernameAlreadyInUse;

  /// No description provided for @sessionExpired.
  ///
  /// In en, this message translates to:
  /// **'Session expired. Please login again'**
  String get sessionExpired;

  /// No description provided for @connectionError.
  ///
  /// In en, this message translates to:
  /// **'Connection error. Check your internet connection'**
  String get connectionError;

  /// No description provided for @serverError.
  ///
  /// In en, this message translates to:
  /// **'Server error. Please try again later'**
  String get serverError;

  /// No description provided for @invalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Invalid email format'**
  String get invalidEmail;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get passwordTooShort;

  /// No description provided for @loginSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Login successful'**
  String get loginSuccessful;

  /// No description provided for @registerSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Registration successful'**
  String get registerSuccessful;

  /// No description provided for @logoutSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Logout successful'**
  String get logoutSuccessful;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @logoutConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logoutConfirmTitle;

  /// No description provided for @logoutConfirmMessage.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout, {userName}?'**
  String logoutConfirmMessage(String userName);

  /// No description provided for @hello.
  ///
  /// In en, this message translates to:
  /// **'Hello, {userName}!'**
  String hello(String userName);

  /// No description provided for @user.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get user;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @editProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// No description provided for @myOrders.
  ///
  /// In en, this message translates to:
  /// **'My Orders'**
  String get myOrders;

  /// No description provided for @favorites.
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get favorites;

  /// No description provided for @addresses.
  ///
  /// In en, this message translates to:
  /// **'Addresses'**
  String get addresses;

  /// No description provided for @comingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming soon'**
  String get comingSoon;

  /// No description provided for @notLoggedIn.
  ///
  /// In en, this message translates to:
  /// **'Not logged in'**
  String get notLoggedIn;

  /// No description provided for @loginToSeeProfile.
  ///
  /// In en, this message translates to:
  /// **'Login to see your profile and orders'**
  String get loginToSeeProfile;

  /// No description provided for @colorLabel.
  ///
  /// In en, this message translates to:
  /// **'Color'**
  String get colorLabel;

  /// No description provided for @availableColors.
  ///
  /// In en, this message translates to:
  /// **'Available colors:'**
  String get availableColors;

  /// No description provided for @dimensionsLabel.
  ///
  /// In en, this message translates to:
  /// **'Dimensions'**
  String get dimensionsLabel;

  /// No description provided for @favoritesLabel.
  ///
  /// In en, this message translates to:
  /// **'Favorites'**
  String get favoritesLabel;

  /// No description provided for @addToCartButton.
  ///
  /// In en, this message translates to:
  /// **'Add to cart'**
  String get addToCartButton;

  /// No description provided for @addedToCartMessage.
  ///
  /// In en, this message translates to:
  /// **'Product added to cart 🛒'**
  String get addedToCartMessage;

  /// No description provided for @errorLoadingProducts.
  ///
  /// In en, this message translates to:
  /// **'Error loading products'**
  String get errorLoadingProducts;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @noProductsFound.
  ///
  /// In en, this message translates to:
  /// **'No products found'**
  String get noProductsFound;

  /// No description provided for @allCategories.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get allCategories;

  /// No description provided for @productDetails.
  ///
  /// In en, this message translates to:
  /// **'Product Details'**
  String get productDetails;

  /// No description provided for @specifications.
  ///
  /// In en, this message translates to:
  /// **'Specifications'**
  String get specifications;

  /// No description provided for @addedToFavorites.
  ///
  /// In en, this message translates to:
  /// **'Added to favorites ❤️'**
  String get addedToFavorites;

  /// No description provided for @removedFromFavorites.
  ///
  /// In en, this message translates to:
  /// **'Removed from favorites'**
  String get removedFromFavorites;

  /// No description provided for @inFavorites.
  ///
  /// In en, this message translates to:
  /// **'In favorites'**
  String get inFavorites;

  /// No description provided for @addToFavorites.
  ///
  /// In en, this message translates to:
  /// **'Add to favorites'**
  String get addToFavorites;

  /// No description provided for @mustLoginToAddFavorites.
  ///
  /// In en, this message translates to:
  /// **'You must log in to add favorites'**
  String get mustLoginToAddFavorites;

  /// No description provided for @errorLoadingImage.
  ///
  /// In en, this message translates to:
  /// **'Error loading image'**
  String get errorLoadingImage;

  /// No description provided for @color.
  ///
  /// In en, this message translates to:
  /// **'Color'**
  String get color;

  /// No description provided for @dimensions.
  ///
  /// In en, this message translates to:
  /// **'Dimensions'**
  String get dimensions;

  /// No description provided for @model3D.
  ///
  /// In en, this message translates to:
  /// **'3D Model'**
  String get model3D;

  /// No description provided for @onlyFavorites.
  ///
  /// In en, this message translates to:
  /// **'Only Favorites'**
  String get onlyFavorites;

  /// No description provided for @clearAllFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear all filters'**
  String get clearAllFilters;

  /// No description provided for @profileTooltip.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTooltip;

  /// No description provided for @settingsTooltip.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTooltip;

  /// No description provided for @cartTooltip.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cartTooltip;

  /// No description provided for @searchTooltip.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get searchTooltip;

  /// No description provided for @homeTooltip.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get homeTooltip;

  /// No description provided for @catalogTooltip.
  ///
  /// In en, this message translates to:
  /// **'Catalog'**
  String get catalogTooltip;

  /// No description provided for @accountSettings.
  ///
  /// In en, this message translates to:
  /// **'Account Settings'**
  String get accountSettings;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @privacy.
  ///
  /// In en, this message translates to:
  /// **'Privacy'**
  String get privacy;

  /// No description provided for @help.
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get help;

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @version.
  ///
  /// In en, this message translates to:
  /// **'Version'**
  String get version;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete your account?'**
  String get deleteAccountConfirm;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @cart.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get cart;

  /// No description provided for @emptyCart.
  ///
  /// In en, this message translates to:
  /// **'Your cart is empty'**
  String get emptyCart;

  /// No description provided for @cartTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get cartTotal;

  /// No description provided for @checkout.
  ///
  /// In en, this message translates to:
  /// **'Checkout'**
  String get checkout;

  /// No description provided for @removeFromCart.
  ///
  /// In en, this message translates to:
  /// **'Remove from cart'**
  String get removeFromCart;

  /// No description provided for @clearCart.
  ///
  /// In en, this message translates to:
  /// **'Clear cart'**
  String get clearCart;

  /// No description provided for @clearCartConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to clear your cart?'**
  String get clearCartConfirm;

  /// No description provided for @quantity.
  ///
  /// In en, this message translates to:
  /// **'Quantity'**
  String get quantity;

  /// No description provided for @subtotal.
  ///
  /// In en, this message translates to:
  /// **'Subtotal'**
  String get subtotal;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @proceedToCheckout.
  ///
  /// In en, this message translates to:
  /// **'Proceed to checkout'**
  String get proceedToCheckout;

  /// No description provided for @itemRemoved.
  ///
  /// In en, this message translates to:
  /// **'Item removed from cart'**
  String get itemRemoved;

  /// No description provided for @cartCleared.
  ///
  /// In en, this message translates to:
  /// **'Cart cleared'**
  String get cartCleared;

  /// No description provided for @orders.
  ///
  /// In en, this message translates to:
  /// **'Orders'**
  String get orders;

  /// No description provided for @orderHistory.
  ///
  /// In en, this message translates to:
  /// **'Order History'**
  String get orderHistory;

  /// No description provided for @orderNumber.
  ///
  /// In en, this message translates to:
  /// **'Order #'**
  String get orderNumber;

  /// No description provided for @orderDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get orderDate;

  /// No description provided for @orderStatus.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get orderStatus;

  /// No description provided for @orderTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get orderTotal;

  /// No description provided for @orderDetails.
  ///
  /// In en, this message translates to:
  /// **'Order Details'**
  String get orderDetails;

  /// No description provided for @trackOrder.
  ///
  /// In en, this message translates to:
  /// **'Track Order'**
  String get trackOrder;

  /// No description provided for @cancelOrder.
  ///
  /// In en, this message translates to:
  /// **'Cancel Order'**
  String get cancelOrder;

  /// No description provided for @reorder.
  ///
  /// In en, this message translates to:
  /// **'Reorder'**
  String get reorder;

  /// No description provided for @noOrders.
  ///
  /// In en, this message translates to:
  /// **'You have no orders yet'**
  String get noOrders;

  /// No description provided for @orderPlaced.
  ///
  /// In en, this message translates to:
  /// **'Order placed successfully'**
  String get orderPlaced;

  /// No description provided for @orderCancelled.
  ///
  /// In en, this message translates to:
  /// **'Order cancelled'**
  String get orderCancelled;

  /// No description provided for @pending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// No description provided for @processing.
  ///
  /// In en, this message translates to:
  /// **'Processing'**
  String get processing;

  /// No description provided for @shipped.
  ///
  /// In en, this message translates to:
  /// **'Shipped'**
  String get shipped;

  /// No description provided for @delivered.
  ///
  /// In en, this message translates to:
  /// **'Delivered'**
  String get delivered;

  /// No description provided for @cancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get cancelled;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @searchProducts.
  ///
  /// In en, this message translates to:
  /// **'Search products...'**
  String get searchProducts;

  /// No description provided for @searchResults.
  ///
  /// In en, this message translates to:
  /// **'Search Results'**
  String get searchResults;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get noResults;

  /// No description provided for @filters.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get filters;

  /// No description provided for @sortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort by'**
  String get sortBy;

  /// No description provided for @priceRange.
  ///
  /// In en, this message translates to:
  /// **'Price Range'**
  String get priceRange;

  /// No description provided for @category.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get category;

  /// No description provided for @applyFilters.
  ///
  /// In en, this message translates to:
  /// **'Apply Filters'**
  String get applyFilters;

  /// No description provided for @clearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear Filters'**
  String get clearFilters;

  /// No description provided for @resultsFound.
  ///
  /// In en, this message translates to:
  /// **'{count} results found'**
  String resultsFound(int count);

  /// No description provided for @sortByNewest.
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get sortByNewest;

  /// No description provided for @sortByPriceAsc.
  ///
  /// In en, this message translates to:
  /// **'Price: Low to High'**
  String get sortByPriceAsc;

  /// No description provided for @sortByPriceDesc.
  ///
  /// In en, this message translates to:
  /// **'Price: High to Low'**
  String get sortByPriceDesc;

  /// No description provided for @sortByPopularity.
  ///
  /// In en, this message translates to:
  /// **'Popularity'**
  String get sortByPopularity;

  /// No description provided for @required.
  ///
  /// In en, this message translates to:
  /// **'This field is required'**
  String get required;

  /// No description provided for @invalidEmailFormat.
  ///
  /// In en, this message translates to:
  /// **'Invalid email format'**
  String get invalidEmailFormat;

  /// No description provided for @passwordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get passwordMismatch;

  /// No description provided for @minLength.
  ///
  /// In en, this message translates to:
  /// **'Minimum {count} characters required'**
  String minLength(int count);

  /// No description provided for @maxLength.
  ///
  /// In en, this message translates to:
  /// **'Maximum {count} characters allowed'**
  String maxLength(int count);

  /// No description provided for @invalidPhoneNumber.
  ///
  /// In en, this message translates to:
  /// **'Invalid phone number'**
  String get invalidPhoneNumber;

  /// No description provided for @invalidPostalCode.
  ///
  /// In en, this message translates to:
  /// **'Invalid postal code'**
  String get invalidPostalCode;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @edit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get back;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @previous.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// No description provided for @done.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get done;

  /// No description provided for @apply.
  ///
  /// In en, this message translates to:
  /// **'Apply'**
  String get apply;

  /// No description provided for @clear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clear;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @share.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get share;

  /// No description provided for @more.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get more;

  /// No description provided for @less.
  ///
  /// In en, this message translates to:
  /// **'Less'**
  String get less;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// No description provided for @viewLess.
  ///
  /// In en, this message translates to:
  /// **'View Less'**
  String get viewLess;

  /// No description provided for @noColorsAvailable.
  ///
  /// In en, this message translates to:
  /// **'No colors available'**
  String get noColorsAvailable;

  /// No description provided for @seeMore.
  ///
  /// In en, this message translates to:
  /// **'See more'**
  String get seeMore;

  /// No description provided for @seeLess.
  ///
  /// In en, this message translates to:
  /// **'See less'**
  String get seeLess;

  /// No description provided for @moreColors.
  ///
  /// In en, this message translates to:
  /// **'more'**
  String get moreColors;

  /// No description provided for @priceRangeLabel.
  ///
  /// In en, this message translates to:
  /// **'Price Range'**
  String get priceRangeLabel;

  /// No description provided for @minimum.
  ///
  /// In en, this message translates to:
  /// **'Minimum'**
  String get minimum;

  /// No description provided for @maximum.
  ///
  /// In en, this message translates to:
  /// **'Maximum'**
  String get maximum;

  /// No description provided for @characteristicsLabel.
  ///
  /// In en, this message translates to:
  /// **'Characteristics'**
  String get characteristicsLabel;

  /// No description provided for @hasModel3D.
  ///
  /// In en, this message translates to:
  /// **'Has 3D model'**
  String get hasModel3D;

  /// No description provided for @viewARProducts.
  ///
  /// In en, this message translates to:
  /// **'View products with AR visualization'**
  String get viewARProducts;

  /// No description provided for @onlyMyFavorites.
  ///
  /// In en, this message translates to:
  /// **'Only my favorites'**
  String get onlyMyFavorites;

  /// No description provided for @showOnlyFavoriteProducts.
  ///
  /// In en, this message translates to:
  /// **'Show only favorite products'**
  String get showOnlyFavoriteProducts;

  /// No description provided for @sortByLabel.
  ///
  /// In en, this message translates to:
  /// **'Sort by'**
  String get sortByLabel;

  /// No description provided for @selectOrder.
  ///
  /// In en, this message translates to:
  /// **'Select order'**
  String get selectOrder;

  /// No description provided for @noSort.
  ///
  /// In en, this message translates to:
  /// **'No sort'**
  String get noSort;

  /// No description provided for @sortByName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get sortByName;

  /// No description provided for @sortByPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get sortByPrice;

  /// No description provided for @sortByNewestFirst.
  ///
  /// In en, this message translates to:
  /// **'Most recent'**
  String get sortByNewestFirst;

  /// No description provided for @ascending.
  ///
  /// In en, this message translates to:
  /// **'Ascending'**
  String get ascending;

  /// No description provided for @descending.
  ///
  /// In en, this message translates to:
  /// **'Descending'**
  String get descending;

  /// No description provided for @clearAllButton.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get clearAllButton;

  /// No description provided for @applyFiltersButton.
  ///
  /// In en, this message translates to:
  /// **'Apply Filters'**
  String get applyFiltersButton;

  /// No description provided for @errorLoadingColors.
  ///
  /// In en, this message translates to:
  /// **'Error loading colors: {error}'**
  String errorLoadingColors(String error);

  /// No description provided for @noProductsAvailable.
  ///
  /// In en, this message translates to:
  /// **'No products available 🛍️'**
  String get noProductsAvailable;

  /// No description provided for @errorLoading.
  ///
  /// In en, this message translates to:
  /// **'Error loading'**
  String get errorLoading;

  /// No description provided for @clearFiltersTooltip.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get clearFiltersTooltip;

  /// No description provided for @unexpectedError.
  ///
  /// In en, this message translates to:
  /// **'Unexpected error'**
  String get unexpectedError;

  /// No description provided for @invalidCredentialsError.
  ///
  /// In en, this message translates to:
  /// **'Invalid credentials'**
  String get invalidCredentialsError;

  /// No description provided for @emailOrPasswordIncorrect.
  ///
  /// In en, this message translates to:
  /// **'Email or password incorrect'**
  String get emailOrPasswordIncorrect;

  /// No description provided for @loginError.
  ///
  /// In en, this message translates to:
  /// **'Login error'**
  String get loginError;

  /// No description provided for @connectionToServerError.
  ///
  /// In en, this message translates to:
  /// **'Connection error to server. Check that backend is running.'**
  String get connectionToServerError;

  /// No description provided for @emailOrUsernameAlreadyInUse.
  ///
  /// In en, this message translates to:
  /// **'Email or username is already in use'**
  String get emailOrUsernameAlreadyInUse;

  /// No description provided for @validationError.
  ///
  /// In en, this message translates to:
  /// **'Validation error'**
  String get validationError;

  /// No description provided for @registrationErrorMessage.
  ///
  /// In en, this message translates to:
  /// **'Error registering'**
  String get registrationErrorMessage;

  /// No description provided for @sessionExpiredRefresh.
  ///
  /// In en, this message translates to:
  /// **'Session expired. Please log in again.'**
  String get sessionExpiredRefresh;

  /// No description provided for @errorRefreshingSession.
  ///
  /// In en, this message translates to:
  /// **'Error refreshing session'**
  String get errorRefreshingSession;

  /// No description provided for @connectionErrorRefreshing.
  ///
  /// In en, this message translates to:
  /// **'Connection error while refreshing session'**
  String get connectionErrorRefreshing;

  /// No description provided for @unexpectedResponseFormat.
  ///
  /// In en, this message translates to:
  /// **'Unexpected response format'**
  String get unexpectedResponseFormat;

  /// No description provided for @errorGettingProducts.
  ///
  /// In en, this message translates to:
  /// **'Error getting products'**
  String get errorGettingProducts;

  /// No description provided for @connectionErrorProducts.
  ///
  /// In en, this message translates to:
  /// **'Connection error'**
  String get connectionErrorProducts;

  /// No description provided for @productNotFound.
  ///
  /// In en, this message translates to:
  /// **'Product not found'**
  String get productNotFound;

  /// No description provided for @errorGettingProduct.
  ///
  /// In en, this message translates to:
  /// **'Error getting product'**
  String get errorGettingProduct;

  /// No description provided for @errorGettingProductsByCategory.
  ///
  /// In en, this message translates to:
  /// **'Error getting products by category'**
  String get errorGettingProductsByCategory;

  /// No description provided for @errorSearchingProducts.
  ///
  /// In en, this message translates to:
  /// **'Error searching products'**
  String get errorSearchingProducts;

  /// No description provided for @errorGettingCart.
  ///
  /// In en, this message translates to:
  /// **'Error getting cart'**
  String get errorGettingCart;

  /// No description provided for @errorAddingToCart.
  ///
  /// In en, this message translates to:
  /// **'Error adding to cart'**
  String get errorAddingToCart;

  /// No description provided for @itemNotFoundInCart.
  ///
  /// In en, this message translates to:
  /// **'Item not found in cart'**
  String get itemNotFoundInCart;

  /// No description provided for @errorUpdatingCart.
  ///
  /// In en, this message translates to:
  /// **'Error updating cart'**
  String get errorUpdatingCart;

  /// No description provided for @errorRemovingFromCart.
  ///
  /// In en, this message translates to:
  /// **'Error removing from cart'**
  String get errorRemovingFromCart;

  /// No description provided for @errorClearingCart.
  ///
  /// In en, this message translates to:
  /// **'Error clearing cart'**
  String get errorClearingCart;

  /// No description provided for @notAuthenticated.
  ///
  /// In en, this message translates to:
  /// **'Not authenticated'**
  String get notAuthenticated;

  /// No description provided for @errorGettingFavorites.
  ///
  /// In en, this message translates to:
  /// **'Error getting favorites'**
  String get errorGettingFavorites;

  /// No description provided for @unauthorized.
  ///
  /// In en, this message translates to:
  /// **'Unauthorized'**
  String get unauthorized;

  /// No description provided for @productAlreadyInFavorites.
  ///
  /// In en, this message translates to:
  /// **'Product already in favorites'**
  String get productAlreadyInFavorites;

  /// No description provided for @errorAddingToFavorites.
  ///
  /// In en, this message translates to:
  /// **'Error adding to favorites'**
  String get errorAddingToFavorites;

  /// No description provided for @favoriteNotFound.
  ///
  /// In en, this message translates to:
  /// **'Favorite not found'**
  String get favoriteNotFound;

  /// No description provided for @errorRemovingFromFavorites.
  ///
  /// In en, this message translates to:
  /// **'Error removing from favorites'**
  String get errorRemovingFromFavorites;

  /// No description provided for @productNotFoundInFavorites.
  ///
  /// In en, this message translates to:
  /// **'Product not found in favorites'**
  String get productNotFoundInFavorites;

  /// No description provided for @errorGettingCategories.
  ///
  /// In en, this message translates to:
  /// **'Error getting categories'**
  String get errorGettingCategories;

  /// No description provided for @errorGettingCategoriesConnection.
  ///
  /// In en, this message translates to:
  /// **'Connection error'**
  String get errorGettingCategoriesConnection;

  /// No description provided for @bearerToken.
  ///
  /// In en, this message translates to:
  /// **'Bearer {token}'**
  String bearerToken(String token);

  /// No description provided for @requestTypeNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Request type not supported'**
  String get requestTypeNotSupported;

  /// No description provided for @viewWidgetCatalog.
  ///
  /// In en, this message translates to:
  /// **'View general widgets catalog'**
  String get viewWidgetCatalog;

  /// No description provided for @errorDisplay.
  ///
  /// In en, this message translates to:
  /// **'Error: {error}'**
  String errorDisplay(String error);

  /// No description provided for @areYouSureLogout.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout?'**
  String get areYouSureLogout;

  /// No description provided for @loginToSeeProfileAndOrders.
  ///
  /// In en, this message translates to:
  /// **'Login to see your profile and orders'**
  String get loginToSeeProfileAndOrders;

  /// No description provided for @username.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get username;

  /// No description provided for @usernameHint.
  ///
  /// In en, this message translates to:
  /// **'johndoe'**
  String get usernameHint;

  /// No description provided for @usernameRequired.
  ///
  /// In en, this message translates to:
  /// **'Username is required'**
  String get usernameRequired;

  /// No description provided for @usernameMinLength.
  ///
  /// In en, this message translates to:
  /// **'Username must be at least 3 characters'**
  String get usernameMinLength;

  /// No description provided for @firstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get firstName;

  /// No description provided for @firstNameOptional.
  ///
  /// In en, this message translates to:
  /// **'First Name (optional)'**
  String get firstNameOptional;

  /// No description provided for @lastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get lastName;

  /// No description provided for @lastNameOptional.
  ///
  /// In en, this message translates to:
  /// **'Last Name (optional)'**
  String get lastNameOptional;

  /// No description provided for @avatarURL.
  ///
  /// In en, this message translates to:
  /// **'Avatar URL'**
  String get avatarURL;

  /// No description provided for @avatarURLHint.
  ///
  /// In en, this message translates to:
  /// **'https://i.pravatar.cc/150?img=10'**
  String get avatarURLHint;

  /// No description provided for @profileUpdatedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully'**
  String get profileUpdatedSuccessfully;

  /// No description provided for @errorUpdatingProfile.
  ///
  /// In en, this message translates to:
  /// **'Error updating profile: {error}'**
  String errorUpdatingProfile(String error);
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['en', 'es'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {


  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en': return AppLocalizationsEn();
    case 'es': return AppLocalizationsEs();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}
