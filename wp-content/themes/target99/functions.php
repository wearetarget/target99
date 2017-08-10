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
if( !is_admin() ){
    function latest_jquery_method() {
        wp_deregister_script('jquery');
        wp_register_script('jquery', ("https://code.jquery.com/jquery-3.2.1.min.js"), '', true);
        wp_enqueue_script('jquery');
    }

    add_action( 'wp_enqueue_scripts', 'latest_jquery_method' );
}

add_action('get_header', 'remove_admin_login_header');
function remove_admin_login_header() {
    remove_action('wp_head', '_admin_bar_bump_cb');
}

// -----------------
// Override template for the related posts plugin
// -----------------

// Return posts with post thumbnails for the thumbnail_excerpt format.
add_filter( 'related_posts_by_taxonomy_shortcode_atts', 'rpbt_thumbnails_target99_args' ); // shortcode
add_filter( 'related_posts_by_taxonomy_widget_args', 'rpbt_thumbnails_target99_args' ); // widget

function rpbt_thumbnails_target99_args( $args ) {
    if (  'thumbnails_target99' === $args['format'] ) {
        $args['post_thumbnail'] = true;
    }

    return $args;
}

// Create new format thumbnails_target99 for use in widget and shortcode
add_action( 'wp_loaded', 'rpbt_thumbnails_target99_format', 11 );

function rpbt_thumbnails_target99_format() {

    if ( !class_exists( 'Related_Posts_By_Taxonomy_Defaults' ) ) {
        return;
    }

    $defaults = Related_Posts_By_Taxonomy_Defaults::get_instance();

    // Add the new format .
    $defaults->formats['thumbnails_target99'] = __( 'Thumbnail for target99' );
}

add_filter( 'related_posts_by_taxonomy_template', 'rpbt_thumbnails_target99_format_template', 10, 3 );

// Return the right template for the thumbnail_excerpt format
function rpbt_thumbnails_target99_format_template( $template, $type, $format ) {
    if ( isset( $format ) && ( 'thumbnails_target99' === $format ) ) {
        return 'related-posts-thumbnails_target99.php';
    }
    return $template;
}

// -----------------
// Custom Post Types
// -----------------

function create_post_types()
{
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

    register_post_type('achievement', array(
        'labels' => array(
            'name' => __('Достижения'),
            'singular_name' => __('Достижение')
        ),
        'description' => 'Отображается на главной в разделе достижений.',
        'public' => true,
        'supports' => array(
            'title',
            'editor',
            'excerpt',
            'thumbnail'
        )
    ));

    register_post_type('partner-info', array(
        'labels' => array(
            'name' => __('Партнёры'),
            'singular_name' => __('Партнёр')
        ),
        'description' => 'Информация о партнёрах отображается на главной странице и в модальном окне там же.',
        'public' => true,
        'supports' => array(
            'title',
            'thumbnail'
        )
    ));

    register_post_type('promo', array(
            'labels' => array(
                'name' => __('Промо материалы'),
                'singular_name' => __('Промо материал')
            ),
            'description' => 'Промо материалы, отображаемые в галерее.',
            'exclude_from_search' => true,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_admin_bar' => true,
            'supports' => array(
                'title',
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

    //Logo texts
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

    // Footer
    $wp_customize->add_setting('target99_logo_footer', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_logo_footer', array(
        'label' => __('Подвал сайта'),
        'section' => 'target99_logo_text',
        'settings' => 'target99_logo_footer'
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

    // Contacts
    $wp_customize->add_section('target99_contacts', array(
        'title' => __('Контакты'),
        'priority' => 30
    ));

    // Facebook
    $wp_customize->add_setting('target99_contact_info', array(
        'transport' => 'refresh'
    ));

    $wp_customize->add_control(new WP_Customize_Control($wp_customize, 'target99_contact_info', array(
        'label' => __('Контакты'),
        'section' => 'target99_contacts',
        'type' => 'textarea',
        'description' => 'Текст для блока контактов.',
        'settings' => 'target99_contact_info'
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
        echo "<nav class='pagination'>";
        echo $paginate_links;
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

function waste_what_func() {
    $waste_what_field = get_field('waste-what');
    $waste_what_component = '';

    if ($waste_what_field) {
        $waste_what_component = '<div class="waste-article__waste-sign-container">';
        $waste_what_component .= $waste_what_field;
        $waste_what_component .= '</div>';
    }

    return $waste_what_component;
}
add_shortcode( 'waste_what', 'waste_what_func' );


function waste_where_func() {
    $waste_where_field = get_field('waste-where');
    $waste_where_component = '';

    if ($waste_where_field) {
        $waste_where_component = '<div class="waste-article__waste-sign-container">';
        $waste_where_component .= $waste_where_field;
        $waste_where_component .= '</div>';
    }

    return $waste_where_component;
}

add_shortcode( 'waste_where', 'waste_where_func' );

?>
