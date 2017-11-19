import gulp from 'gulp';
import watch from './helpers/watch';
import './build-translators';

watch('translators', 'translators/**/*.js');
