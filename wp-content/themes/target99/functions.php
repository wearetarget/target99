<?php

	// ----------------
	// Scripts & Styles
	// ----------------

	// Below is the proper way to load Javascript and CSS files. Stop loading them in your header/footer files!
	function my_scripts_method() {
		wp_enqueue_style( 'main-style', get_stylesheet_directory_uri() . '/css/main.min.css');
		wp_enqueue_script('main-script', get_stylesheet_directory_uri() . '/js/main.min.js', array( 'jquery' ), '', true);
	}

	add_action( 'wp_enqueue_scripts', 'my_scripts_method' );


	// ------
	// JQuery
	// ------

	// Force Wordpress to use the latest version of JQuery
	// if we're not logged in as an admin...
	// ...it seems like Wordpress is touchy about it's version of JQuery there.
	if( !is_admin() ){
		function latest_jquery_method() {
			wp_deregister_script('jquery');
			wp_register_script('jquery', ("https://code.jquery.com/jquery-3.2.1.min.js"), '', true);
			wp_enqueue_script('jquery');
		}

		add_action( 'wp_enqueue_scripts', 'latest_jquery_method' );
	}


	// ---------
	// Admin Bar
	// ---------

	// Remove "Comments" from the admin bar
	function my_remove_menu_pages() {
		remove_menu_page('edit-comments.php');
	}

	add_action( 'admin_menu', 'my_remove_menu_pages' );


	// ----------------
	// Theme Extensions
	// ----------------

	// Dislpay "Menus" under "Appearance" tab on the admin bar
	add_theme_support( 'menus' );

	// Allow pages/posts to show "Featured Image"
	add_theme_support( 'post-thumbnails' );


	// -------------------------------
	// Custom Loop Advanced Pagination
	// -------------------------------

	function custom_pagination($numpages = '', $pagerange = '', $paged='') {

		if (empty($pagerange)) {
			$pagerange = 2;
		}

		/**
		* This first part of our function is a fallback
		* for custom pagination inside a regular loop that
		* uses the global $paged and global $wp_query variables.
		*
		* It's good because we can now override default pagination
		* in our theme, and use this function in default quries
		* and custom queries.
		*/
		global $paged;

		if (empty($paged)) {
			$paged = 1;
		}

		if ($numpages == '') {
			global $wp_query;
			$numpages = $wp_query->max_num_pages;

			if(!$numpages) {
				$numpages = 1;
			}
		}

		/**
		* We construct the pagination arguments to enter into our paginate_links
		* function.
		*/
		$big = 999999999;

		$pagination_args = array(
			// 'base'            => get_pagenum_link(1) . '%_%',
			'base'			  => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
			'format'          => '/page/%#%',
			// 'format' => '?paged=%#%',
			'total'           => $numpages,
			'current'         => $paged,
			'show_all'        => False,
			'end_size'        => 1,
			'mid_size'        => $pagerange,
			'post_status'     => array('publish'),
			'prev_next'       => True,
			'prev_text'       => __('&lt;'),
			'next_text'       => __('&gt;'),
			'type'            => 'plain',
			'add_args'        => false,
			'add_fragment'    => ''
		);

		// $pagination_args_2 = array(
			// 'base' => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
		// 	'format' => '?paged=%#%',
		// 	'current' => max( 1, get_query_var('paged') ),
		// 	'total' => $search->max_num_pages
		// );

		$paginate_links = paginate_links($pagination_args);

		if ($paginate_links) {
			echo "<nav class='posts__pagination posts__pagination--advanced'>";
			echo $paginate_links;
			echo "<div class='page-numbers page-count'>Page " . $paged . " of " . $numpages . "</div> ";
			echo "</nav>";
		}

	}


	// ----------------
	// Helper Functions
	// ----------------

	/*
		Imploding an associative array will return both the key
		and its associated value. Normal array implosion will just
		return the value, but I want both values. Know what I'm sayin?
	*/

	function trim_title($title) {
		return wp_trim_words( $title, 18, '...' );
	}

	function trim_excerpt($excerpt) {
		return wp_trim_words( $excerpt, 55, '...' );
	}

// ---------------------
// Remove Content Editor
// ---------------------

/*
	Removes the WYSIWYG content editor box from certain pages because it's unused
*/

add_action('init', 'remove_editor_init');

function remove_editor_init() {
	// if post not set, just return
	// fix when post not set, throws PHP's undefined index warning
	if (isset($_GET['post'])) {
		$post_id = $_GET['post'];
	} else if (isset($_POST['post_ID'])) {
		$post_id = $_POST['post_ID'];
	} else {
		return;
	}
	$template_path = 'templates/';
	$template_file = get_post_meta($post_id, '_wp_page_template', true);
	if ($template_file == 'templates/template-homepage.php') {
		remove_post_type_support('page', 'editor');
	}
}

?>
