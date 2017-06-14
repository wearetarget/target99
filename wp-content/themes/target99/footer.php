    </div><!-- #page -->

    <footer class="footer">
        <div class="footer__inner-container layout__service">
            <a href="#" class="footer__site-map-link">Карта сайта</a>
            <div class="footer__logo-container">
                <img class="footer__logo" src="<?php bloginfo('template_url'); ?>/images/logo.png"/>
                <span class="footer__logo-text"><?php echo get_theme_mod('target99_logo_footer'); ?></span>
            </div>

            <div class="footer__socials-container">
                <?php include('templates/template-parts/template-part-socials.php'); ?>
            </div>
        </div>
        <?php wp_footer(); ?>
    </footer>

</div><!-- layout -->

</body>

</html>