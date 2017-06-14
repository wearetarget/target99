<?php

// ----------------
// Scripts & Styles
// ----------------

// Below is the proper way to load Javascript and CSS files. Stop loading them in your header/footer files!
function my_scripts_method()
{
    wp_enqueue_style('main-style', get_stylesheet_directory_uri() . '/css/main.min.css');
    wp_enqueue_script('main-script', get_stylesheet_directory_uri() . '/js/main.min.js', array('jquery'), '', true);
}

add_action('wp_enqueue_scripts', 'my_scripts_method');


// ------
// JQuery
// ------

// Force Wordpress to use the latest version of JQuery
// if we're not logged in as an admin...
// ...it seems like Wordpress is touchy about it's version of JQuery there.
if (!is_admin()) {
    function latest_jquery_method()
    {
        wp_deregister_script('jquery');
        wp_register_script('jquery', ("https://code.jquery.com/jquery-3.2.1.min.js"), '', true);
        wp_enqueue_script('jquery');
    }

    add_action('wp_enqueue_scripts', 'latest_jquery_method');
}

// -----------------
// Custom Post Types
// -----------------

function create_post_types()
{
    // News

    register_post_type('waste-info', array(
        'labels' => array(
            'name' => __('Информация об отходах'),
            'singular_name' => __('Информация об отходах')
        ),
        'description' => 'Краткая информация показывается на главной, полная - при переходе по ссылке.',
        'public' => true,
        'supports' => array(
            'title',
            'thumbnail',
            'editor',
            'excerpt'
        )
    ));

    register_post_type('achievements', array(
        'labels' => array(
            'name' => __('Достижения'),
            'singular_name' => __('Достижение')
        ),
        'description' => 'Отображается на главной в разделе достижений.',
        'public' => true,
        'supports' => array(
            'title',
            'excerpt',
            'thumbnail'
        )
    ));

    // Location
    register_post_type('partner-info', array(
        'labels' => array(
            'name' => __('Партнёры'),
            'singular_name' => __('Партнёр')
        ),
        'description' => 'Информация о партнёрах отображается на главной странице и в модальном окне там же.',
        'public' => true,
        'supports' => array(
            'title',
            'editor',
            'thumbnail'
        )
    ));

}

add_action('init', 'create_post_types');


// -------------------------------------
// Theme Appearance Customization Panels
// -------------------------------------

/*
    Log into the site's admin section and go to Appearance - Customize.
    There are a few options to edit - like "Site Identity" & "Static Front Page" and stuff.
    Let's add some more
*/

function my_custom_register($wp_customize)
{
    $wp_customize->add_section('target99_logo_text', array(
        'title' => __('Логотип'),
        'priority' => 30
    ));

    // Main
    $wp_customize->add_setting('target99_logo_title', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_logo_title', array(
        'label' => __('Главный текст'),
        'section' => 'target99_logo_text',
        'settings' => 'target99_logo_title'
    )));

    // Secondary
    $wp_customize->add_setting('target99_logo_secondary', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_logo_secondary', array(
        'label' => __('Мелкий текст'),
        'section' => 'target99_logo_text',
        'settings' => 'target99_logo_secondary'
    )));

    // Social Media
    $wp_customize->add_section('target99_social_media', array(
        'title' => __('Соц. сети'),
        'priority' => 30
    ));

    // Facebook
    $wp_customize->add_setting('target99_media_facebook', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_media_facebook', array(
        'label' => __('Facebook'),
        'section' => 'target99_social_media',
        'description' => 'Ссылка на группу в facebook.',
        'settings' => 'target99_media_facebook'
    )));

    // Youtube
    $wp_customize->add_setting('target99_media_youtube', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_media_youtube', array(
        'label' => __('Youtube'),
        'section' => 'target99_social_media',
        'description' => 'Ссылка на канал в youtube.',
        'settings' => 'target99_media_youtube'
    )));

    // Вконтакте
    $wp_customize->add_setting('target99_media_vk', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_media_vk', array(
        'label' => __('VK'),
        'section' => 'target99_social_media',
        'description' => 'Ссылка на группу в vk.',
        'settings' => 'target99_media_vk'
    )));
}

add_action('customize_register', 'my_custom_register');


// ----------------
// Theme Extensions
// ----------------

// Dislpay "Menus" under "Appearance" tab on the admin bar
add_theme_support('menus');

// Allow pages/posts to show "Featured Image"
add_theme_support('post-thumbnails');


// -------------------------------
// Custom Loop Advanced Pagination
// -------------------------------

function custom_pagination($numpages = '', $pagerange = '', $paged = '')
{

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

        if (!$numpages) {
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
        'base' => str_replace($big, '%#%', esc_url(get_pagenum_link($big))),
        'format' => '/page/%#%',
        // 'format' => '?paged=%#%',
        'total' => $numpages,
        'current' => $paged,
        'show_all' => False,
        'end_size' => 1,
        'mid_size' => $pagerange,
        'post_status' => array('publish'),
        'prev_next' => True,
        'prev_text' => __('&lt;'),
        'next_text' => __('&gt;'),
        'type' => 'plain',
        'add_args' => false,
        'add_fragment' => ''
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

/*
    Functions to unify length of the excerpt and the title.
*/

function trim_title($title)
{
    return wp_trim_words($title, 18, '...');
}

function trim_excerpt($excerpt)
{
    return wp_trim_words($excerpt, 55, '...');
}

?>
