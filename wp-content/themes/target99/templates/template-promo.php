<?php

	/*
		Template Name: Promo
	*/

	$paged = ( get_query_var('paged') ) ? get_query_var('paged') : 1;

	$promo_args = [
		'post_status' => array('publish'),
		'post_type' => array('promo'),
		'order' => 'ASC',
		'orderby' => 'date',
		'posts_per_page' => 3,
		'paged' => $paged
	];

	$promo_query = new WP_Query($promo_args);

	get_header();
?>

<script>
	window.target99 = window.target99 || {};
	window.target99.activePromoPreviewId = null;

	function previewPromo(id){
		var promoToPreview = jQuery('#promo__image--' + id);
		var promoContainer = promoToPreview.parent();
        var previewImgSrc = promoToPreview.get(0).src;
        var tipElement = jQuery('#promo-preview__tip').get(0);
        var fileUrl = promoContainer.get(0).dataset.fileUrl;

		if (window.target99.activePromoPreviewId !== id) {
            jQuery('#promo-preview__download').get(0).href = fileUrl;
            jQuery('#promo-preview__controls-container').show();

            if (previewImgSrc !== window.location.href ) {
                jQuery('#promo-preview__tip-container').hide();
                jQuery('#promo-preview__image').get(0).src = previewImgSrc;
                jQuery('#promo-preview__image-container').show();
            } else {
                jQuery('#promo-preview__image-container').hide();
                jQuery('#promo-preview__tip-container').show();
                tipElement.innerHTML = "Предпросмотр недоступен.";
            }

			window.target99.activePromoPreviewId = id;
            jQuery('#promo-page .promo').removeClass('promo--active');
			promoContainer.addClass('promo--active');

		} else {
            jQuery('#promo-preview__image-container').hide();
            jQuery('#promo-preview__controls-container').hide();

            jQuery('#promo-preview__tip-container').show();
            jQuery('#promo-preview__image').get(0).src = null;
            tipElement.innerHTML = "Выберите один из промо файлов.";

			promoContainer.removeClass('promo--active');
			window.target99.activePromoPreviewId = null;
		}
	}
</script>

<?php if ($promo_query->have_posts()) : ?>
<section id="promo-page" class="promo-page">
	<div class="promo-page__inner-container layout__content">
		<div class="promo-page__title-container">
			<h2 class="promo-page__title">Информация об отходах</h2>
		</div>

		<div class="promo-page__preview-container">
			<div class="promo-preview">
				<div id="promo-preview__image-container" class="promo-preview__image-container">
					<div class="promo-preview__image-wrap">
						<img id="promo-preview__image" class="promo-preview__image" src="" />	
					</div>
				</div>
				<div id="promo-preview__tip-container" class="promo-preview__tip-container">
					<div id="promo-preview__tip" class="promo-preview__tip">Выберите один из промо файлов.</div>
				</div>
				<div id="promo-preview__controls-container" class="promo-preview__controls-container">
					<a id="promo-preview__download" class="promo-preview__control fa fa-download" href='#' target="_blank"></a>
				</div>
			</div>
		</div>

		<div class="promo-page__promos-list">

				<?php
					while ($promo_query->have_posts()) {
						$promo_query->the_post();
						$promo_preview_src = wp_get_attachment_image_src(get_post_thumbnail_id(), 'full')[0];

				?>
					<div class="promo-page__promo-item">
						<div class="promo" data-file-url="<?php echo get_field('promo-file')['url']; ?>">
							<img id="promo__image--<?php echo get_the_ID(); ?>" src="<?php echo $promo_preview_src; ?>"/>
							<div class="promo__title-container" onclick="previewPromo('<?php echo get_the_ID(); ?>')">
								<span class="promo__title"><?php echo get_the_title(); ?></span>
							</div>
						</div>
					</div>
				<?php
					}

					wp_reset_postdata();
				?>

		</div>

		<div class="promo-page__pagination-container">
			<?php custom_pagination($promo_query->max_num_pages, "", $paged); ?>
		</div>
	</div>
</section>
<?php endif; ?>


<?php get_footer(); ?>

