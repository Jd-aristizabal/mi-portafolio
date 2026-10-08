<script lang="ts">
  import { translate as t } from '$lib/stores/language';
  import '../app.css';
  import '$lib/styles/readability.css';
  import '$lib/styles/themes.css';
  import '$lib/styles/details.css';
  import '$lib/styles/arcade.css';
  import { page } from '$app/stores';
  import Icon from '$lib/components/Icon.svelte';
  import Chatbot from '$lib/components/Chatbot.svelte';
  import NavigationMotion from '$lib/components/NavigationMotion.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import LanguageToggle from '$lib/components/LanguageToggle.svelte';
  import { onMount } from 'svelte';
  import { language, languageActions } from '$lib/stores/language';
  import { languageService } from '$lib/services/languageService';
  import { contact } from '$lib/data/config';
  let menuOpen = false;
  $: path = $page.url.pathname;
  $: if (path) menuOpen = false;
  $: if (typeof document !== 'undefined') languageService.apply($language, path === '/');
  onMount(languageActions.initialize);
</script>
<svelte:head><meta name="description" content="{$t("Portafolio de Johan Aristizabal. Diseño, desarrollo frontend y experiencias interactivas con SvelteKit.")}" /></svelte:head>
<a class="skip-link" href="#main">{$t("Saltar al contenido")}</a>
<header class="site-header" class:home-header={path === '/'}>
  <a href="/" class="brand" aria-label="{$t("Johan Aristizabal, inicio")}"><span class="brand-symbol">j<span>.</span></span><span>johan<span class="muted">/</span>aristizabal</span></a>
  <nav class:mobile-open={menuOpen} aria-label="{$t("Navegación principal")}"><a href="/#works" class:active={path.startsWith('/works')} on:click={() => menuOpen = false}>{$t("Works")} <span>04</span></a><a href="/#skills" on:click={() => menuOpen = false}>{$t("Skills")}</a><a href="/#about" on:click={() => menuOpen = false}>{$t("Sobre mí")}</a><a class="nav-contact" href={contact.whatsappUrl} target="_blank" rel="noreferrer">{$t("Hablemos")} <Icon name="external" size={15} /></a></nav>
  <div class="header-actions"><ThemeToggle /><LanguageToggle /><button class="mobile-menu icon-button" aria-label={$t(menuOpen ? 'Cerrar menú' : 'Abrir menú')} aria-expanded={menuOpen} on:click={() => menuOpen = !menuOpen}><Icon name={menuOpen ? 'close' : 'menu'} /></button></div>
</header>
<main id="main">{#key path}<div class="route-stage"><slot /></div>{/key}</main>
<footer class="site-footer" class:home-footer={path === '/'}><a href="/" class="footer-name">Johan Aristizabal<span>© {new Date().getFullYear()}</span></a><span>{$t("Hecho con intención, en Colombia")} <span class="country-dot"></span></span><a href={contact.emailUrl}>{contact.email} ↗</a></footer>
<Chatbot />
<NavigationMotion />
